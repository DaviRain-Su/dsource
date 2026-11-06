import { AdminDesk } from "@/components/admin/admin-desk"
import { listResources } from "@/lib/resources"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const items = await listResources({ includeDrafts: true })
  const adminOpen = !process.env.ADMIN_SECRET?.trim()
  return <AdminDesk initialItems={items} adminOpen={adminOpen} />
}
