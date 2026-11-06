"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Desk } from "@/components/ui/desk"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StickyNote } from "@/components/ui/sticky-note"
import { Textarea } from "@/components/ui/textarea"
import {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPES,
  displayTitle,
  type Resource,
  type ResourceInput,
} from "@/lib/types"

type Props = {
  initialItems: Resource[]
  adminOpen: boolean
}

const emptyForm: ResourceInput = {
  title: "",
  title_zh: "",
  summary: "",
  summary_zh: "",
  body: "",
  body_zh: "",
  source_type: "article",
  source_url: "",
  source_author: "",
  source_lang: "zh",
  tags: [],
  cover_url: "",
  media_urls: [],
  status: "published",
  featured: false,
}

function adminHeaders(): HeadersInit {
  const secret =
    typeof window !== "undefined" ? window.localStorage.getItem("dsource_admin_secret") || "" : ""
  return secret ? { "content-type": "application/json", "x-admin-secret": secret } : { "content-type": "application/json" }
}

export function AdminDesk({ initialItems, adminOpen }: Props) {
  const [items, setItems] = React.useState(initialItems)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<ResourceInput>(emptyForm)
  const [tagText, setTagText] = React.useState("")
  const [mediaText, setMediaText] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    const saved = window.localStorage.getItem("dsource_admin_secret") || ""
    setSecret(saved)
  }, [])

  const saveSecret = () => {
    window.localStorage.setItem("dsource_admin_secret", secret.trim())
    setMessage("管理密钥已保存在本机")
  }

  const load = (item: Resource) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      title_zh: item.title_zh,
      summary: item.summary,
      summary_zh: item.summary_zh,
      body: item.body,
      body_zh: item.body_zh,
      source_type: item.source_type,
      source_url: item.source_url,
      source_author: item.source_author,
      source_lang: item.source_lang,
      tags: item.tags,
      cover_url: item.cover_url,
      media_urls: item.media_urls,
      status: item.status,
      featured: item.featured,
      slug: item.slug,
    })
    setTagText(item.tags.join(", "))
    setMediaText(item.media_urls.join("\n"))
  }

  const reset = () => {
    setEditingId(null)
    setForm(emptyForm)
    setTagText("")
    setMediaText("")
  }

  const payload = (): ResourceInput => ({
    ...form,
    tags: tagText
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean),
    media_urls: mediaText
      .split(/\n/)
      .map((t) => t.trim())
      .filter(Boolean),
  })

  const submit = async () => {
    setBusy(true)
    setMessage("")
    try {
      const body = payload()
      if (!body.title.trim() && !body.title_zh?.trim()) {
        setMessage("至少填一个标题")
        return
      }
      if (!body.title.trim()) body.title = body.title_zh || "Untitled"
      const res = editingId
        ? await fetch(`/api/resources/${editingId}`, {
            method: "PATCH",
            headers: adminHeaders(),
            body: JSON.stringify(body),
          })
        : await fetch("/api/resources", {
            method: "POST",
            headers: adminHeaders(),
            body: JSON.stringify(body),
          })
      if (!res.ok) {
        setMessage(res.status === 401 ? "未授权：请填写正确的 ADMIN_SECRET" : `保存失败 (${res.status})`)
        return
      }
      const data = (await res.json()) as { item: Resource }
      setItems((prev) => {
        const rest = prev.filter((x) => x.id !== data.item.id)
        return [data.item, ...rest]
      })
      setMessage(editingId ? "已更新" : "已新增")
      reset()
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm("确定删除这条资源？")) return
    setBusy(true)
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE", headers: adminHeaders() })
      if (!res.ok) {
        setMessage(res.status === 401 ? "未授权" : "删除失败")
        return
      }
      setItems((prev) => prev.filter((x) => x.id !== id))
      if (editingId === id) reset()
      setMessage("已删除")
    } finally {
      setBusy(false)
    }
  }

  const setField = <K extends keyof ResourceInput>(key: K, value: ResourceInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Desk objects={["ruler", "clips"]} seed="admin-desk" className="min-h-svh">
      <div className="mx-auto w-full max-w-[78rem] px-4 py-8 sm:px-8 sm:py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-type text-sm tracking-[0.18em] text-ink-muted uppercase">Back office</p>
            <h1 className="font-script text-4xl font-bold text-ink sm:text-5xl">后台 · 贴纸台</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              新增或编辑收录内容。中文字段会优先在前台展示；原文可留空。
            </p>
          </div>
          <Button asChild variant="secondary" seed="home">
            <Link href="/">回前台</Link>
          </Button>
        </header>

        <div className="mb-6 flex flex-wrap items-end gap-3">
          {!adminOpen ? (
            <>
              <div className="min-w-[16rem] flex-1">
                <Label htmlFor="admin-secret">ADMIN_SECRET</Label>
                <Input
                  id="admin-secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="发布后在此填入密钥"
                  seed="secret"
                />
              </div>
              <Button onClick={saveSecret} seed="save-secret">
                保存密钥
              </Button>
            </>
          ) : (
            <StickyNote color="green" seed="open-admin" className="text-base">
              本地样例模式：写入未加锁。发布后请绑定 ADMIN_SECRET。
            </StickyNote>
          )}
          {message ? <p className="text-sm text-ink-you">{message}</p> : null}
        </div>

        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <Paper stock="card" seed="editor" className="p-5 sm:p-7">
            <h2 className="font-script text-2xl font-bold text-ink">
              {editingId ? "编辑资源" : "新增资源"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="中文标题" value={form.title_zh ?? ""} onChange={(v) => setField("title_zh", v)} />
              <Field label="原标题" value={form.title} onChange={(v) => setField("title", v)} />
              <Field
                label="中文摘要"
                value={form.summary_zh ?? ""}
                onChange={(v) => setField("summary_zh", v)}
                area
              />
              <Field label="原摘要" value={form.summary ?? ""} onChange={(v) => setField("summary", v)} area />
              <div className="sm:col-span-2">
                <Field
                  label="中文正文（支持 ## 小标题与 - 列表）"
                  value={form.body_zh ?? ""}
                  onChange={(v) => setField("body_zh", v)}
                  area
                  rows={10}
                />
              </div>
              <div className="sm:col-span-2">
                <Field label="原文正文" value={form.body ?? ""} onChange={(v) => setField("body", v)} area rows={8} />
              </div>
              <div>
                <Label>来源类型</Label>
                <Select
                  value={form.source_type ?? "article"}
                  onValueChange={(v) => setField("source_type", v)}
                >
                  <SelectTrigger seed="type">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {SOURCE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="作者" value={form.source_author ?? ""} onChange={(v) => setField("source_author", v)} />
              <Field label="来源链接" value={form.source_url ?? ""} onChange={(v) => setField("source_url", v)} />
              <Field
                label="原文语言"
                value={form.source_lang ?? "zh"}
                onChange={(v) => setField("source_lang", v)}
              />
              <Field label="标签（逗号分隔）" value={tagText} onChange={setTagText} />
              <Field label="封面 URL" value={form.cover_url ?? ""} onChange={(v) => setField("cover_url", v)} />
              <div className="sm:col-span-2">
                <Field
                  label="媒体 URL（每行一个）"
                  value={mediaText}
                  onChange={setMediaText}
                  area
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(form.featured)}
                    onChange={(e) => setField("featured", e.target.checked)}
                  />
                  精选
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={(form.status ?? "published") === "published"}
                    onChange={(e) => setField("status", e.target.checked ? "published" : "draft")}
                  />
                  已发布
                </label>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={submit} disabled={busy} seed="save">
                {busy ? "保存中…" : editingId ? "更新" : "创建"}
              </Button>
              {editingId ? (
                <Button variant="secondary" onClick={reset} seed="cancel">
                  取消编辑
                </Button>
              ) : null}
            </div>
          </Paper>

          <Paper stock="pad" seed="list" className="p-4 sm:p-5">
            <h2 className="font-script text-2xl font-bold text-ink">已收录 ({items.length})</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-sm border border-pencil-mark/40 bg-slip/70 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink">{displayTitle(item)}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        <Badge variant="secondary" className="mr-1">
                          {SOURCE_TYPE_LABELS[item.source_type] ?? item.source_type}
                        </Badge>
                        {item.status}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="xs" variant="secondary" onClick={() => load(item)} seed={`e-${item.id}`}>
                        编辑
                      </Button>
                      <Button size="xs" variant="destructive" onClick={() => remove(item.id)} seed={`d-${item.id}`}>
                        删
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Paper>
        </div>
      </div>
    </Desk>
  )
}

function Field({
  label,
  value,
  onChange,
  area,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  area?: boolean
  rows?: number
}) {
  const id = React.useId()
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {area ? (
        <Textarea id={id} value={value} rows={rows} onChange={(e) => onChange(e.target.value)} seed={id} />
      ) : (
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} seed={id} />
      )}
    </div>
  )
}
