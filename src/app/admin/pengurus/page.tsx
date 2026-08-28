import { PengurusManager } from "./pengurus-manager"
import { getPenguruses } from "@/lib/actions"

export default async function PengurusPage() {
  const pengurus = await getPenguruses()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Susunan Pengurus</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data pengurus organisasi</p>
      </div>
      <PengurusManager initialData={pengurus} />
    </div>
  )
}
