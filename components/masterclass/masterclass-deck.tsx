import { MasterclassPages } from "@/components/masterclass/slides"

export function MasterclassDeck() {
  return (
    <div className="masterclass-deck dark bg-neutral-950 text-white">
      <div className="masterclass-page-stack mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-8 print:max-w-none print:gap-0 print:p-0">
        <MasterclassPages />
      </div>
    </div>
  )
}
