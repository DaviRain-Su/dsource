import { AdminDesk } from "@/components/admin/admin-desk"
import { listResources } from "@/lib/resources"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  // Public SSR only gets published rows; drafts load client-side with the admin secret.
  const items = await listResources({ includeDrafts: false })
  return <AdminDesk initialItems={items} />
}
