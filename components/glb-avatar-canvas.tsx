"use client"

import { Suspense, useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Center, Environment, OrbitControls, useAnimations, useGLTF } from "@react-three/drei"
import type { Object3D } from "three"

import { cn } from "@/lib/utils"

type GlbModelProps = {
  url: string
  mouth?: number
  onModelInfo?: (info: GlbModelInfo) => void
}

type MorphTargetHandle = {
  mesh: any
  indices: number[]
}

export type GlbModelInfo = {
  /** Mesh morph target names discovered in the scene. */
  morphTargetNames: string[]
  /** Names matched by our auto mouth regex. */
  mouthMorphMatches: string[]
  /** Nodes matched by our jaw bone regex. */
  jawNodeNames: string[]
}

function GlbModel({ url, mouth = 0, onModelInfo }: GlbModelProps) {
  const rootRef = useRef<Object3D>(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, rootRef)

  const handles = useMemo(() => {
    const morphs: MorphTargetHandle[] = []
    const jaws: Object3D[] = []
    const jawNodeNames: string[] = []
    const morphTargetNames: string[] = []
    const mouthMorphMatches: string[] = []

    scene.traverse((obj: any) => {
      // Jaw bone (common in Mixamo / humanoid rigs)
      if (typeof obj?.name === "string" && /(^|_|-|\b)jaw(\b|_|-)/i.test(obj.name)) {
        jaws.push(obj as Object3D)
        jawNodeNames.push(obj.name)
      }

      const dict = obj?.morphTargetDictionary as Record<string, number> | undefined
      const inf = obj?.morphTargetInfluences as number[] | undefined
      if (!dict || !inf) return

      const keys = Object.keys(dict)
      for (const k of keys) morphTargetNames.push(k)
      const match = keys.filter((k) =>
        /(jawopen|mouthopen|viseme(_|-)?aa|viseme(_|-)?a|aa\b|mouth_open|open\b)/i.test(k)
      )
      if (!match.length) return
      for (const m of match) mouthMorphMatches.push(m)
      const indices = match
        .map((k) => dict[k])
        .filter((v) => typeof v === "number" && Number.isFinite(v)) as number[]
      if (!indices.length) return

      morphs.push({ mesh: obj, indices })
    })

    // de-dupe while keeping stable ordering
    const uniq = (arr: string[]) => Array.from(new Set(arr))
    return {
      morphs,
      jaws,
      info: {
        morphTargetNames: uniq(morphTargetNames),
        mouthMorphMatches: uniq(mouthMorphMatches),
        jawNodeNames: uniq(jawNodeNames),
      } satisfies GlbModelInfo,
    }
  }, [scene])

  useEffect(() => {
    onModelInfo?.(handles.info)
  }, [handles.info, onModelInfo, url])

  useEffect(() => {
    const clips = Object.values(actions).filter(Boolean)
    const first = clips[0]
    first?.reset().fadeIn(0.35).play()
    return () => {
      clips.forEach((a) => a?.fadeOut(0.2))
    }
  }, [actions, url])

  useFrame(() => {
    const v = Math.max(0, Math.min(1, mouth))

    // Blendshapes / visemes
    for (const h of handles.morphs) {
      const influences = h.mesh.morphTargetInfluences as number[] | undefined
      if (!influences) continue
      for (const idx of h.indices) influences[idx] = v
    }

    // Bone rotation fallback
    for (const j of handles.jaws) {
      const anyObj: any = j as any
      if (anyObj?.rotation) anyObj.rotation.x = v * 0.35
    }
  })

  useEffect(() => {
    return () => {
      useGLTF.clear(url)
    }
  }, [url])

  return (
    <Center>
      <primitive ref={rootRef} object={scene} />
    </Center>
  )
}

type SceneProps = {
  url: string
  mouth?: number
  onModelInfo?: (info: GlbModelInfo) => void
}

function Scene({ url, mouth, onModelInfo }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <GlbModel url={url} mouth={mouth} onModelInfo={onModelInfo} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        makeDefault
        minDistance={0.8}
        maxDistance={12}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2}
        enableDamping
      />
    </>
  )
}

type GlbAvatarCanvasProps = {
  url: string
  className?: string
  /** 0..1 mouth open value (e.g. from audio RMS). */
  mouth?: number
  onModelInfo?: (info: GlbModelInfo) => void
}

/**
 * Renders a GLB/GLTF in a React Three Fiber canvas with orbit + environment lighting.
 * `url` must be a fetchable path (e.g. object URL from an upload or `/models/foo.glb`).
 */
export function GlbAvatarCanvas({ url, className, mouth, onModelInfo }: GlbAvatarCanvasProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/60",
        "h-[min(58vh,440px)] min-h-[260px]",
        className
      )}
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.1, 3.35], fov: 40, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        className="h-full w-full"
      >
        <Scene url={url} mouth={mouth} onModelInfo={onModelInfo} />
      </Canvas>
    </div>
  )
}
