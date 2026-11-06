import { ResourceHub } from "@/components/hub/resource-hub"
import { listResources } from "@/lib/resources"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const items = await listResources()
  return <ResourceHub initialItems={items} sample={!process.env.DATABASE_URL} />
}
