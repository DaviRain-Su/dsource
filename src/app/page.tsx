import { ResourceHub } from "@/components/hub/resource-hub"
import { listResources } from "@/lib/resources"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // Fail soft so Preview never hangs forever if Postgres is slow/unreachable.
  let items: Awaited<ReturnType<typeof listResources>> = []
  try {
    items = await listResources()
  } catch (error) {
    console.error("listResources failed", error)
  }
  return <ResourceHub initialItems={items} sample={!process.env.DATABASE_URL} />
}
