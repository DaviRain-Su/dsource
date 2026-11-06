"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Desk } from "@/components/ui/desk"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { IndexCard } from "@/components/ui/index-card"
import { Input } from "@/components/ui/input"
import { Notebook } from "@/components/ui/notebook"
import { Paper } from "@/components/ui/paper"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Stamp } from "@/components/ui/stamp"
import { StickyNote } from "@/components/ui/sticky-note"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { isSafeHttpUrl } from "@/lib/safe-url"
import {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPES,
  displayBody,
  displaySummary,
  displayTitle,
  type Resource,
} from "@/lib/types"

type Props = {
  initialItems: Resource[]
  sample?: boolean
}

const SHELVES = [
  { id: "all", name: "全部" },
  ...SOURCE_TYPES.map((id) => ({ id, name: SOURCE_TYPE_LABELS[id] ?? id })),
]

function relativeTime(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ""
  const diff = Date.now() - t
  const m = Math.floor(diff / 60000)
  if (m < 1) return "刚刚"
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 14) return `${d} 天前`
  return new Date(t).toLocaleDateString("zh-CN")
}

function renderBody(text: string) {
  const blocks = text.split(/\n{2,}/)
  return blocks.map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={i} className="font-script mt-6 text-2xl font-bold text-ink first:mt-0">
          {trimmed.slice(3)}
        </h3>
      )
    }
    if (trimmed.startsWith("- ")) {
      const lines = trimmed.split("\n").map((l) => l.replace(/^- /, "").trim())
      return (
        <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink-soft">
          {lines.map((line, j) => (
            <li key={j}>{line}</li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-ink-soft first:mt-0">
        {trimmed}
      </p>
    )
  })
}

export function ResourceHub({ initialItems, sample }: Props) {
  const [items] = React.useState(initialItems)
  const [shelf, setShelf] = React.useState("all")
  const [q, setQ] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialItems.find((r) => r.featured)?.id ?? initialItems[0]?.id ?? null,
  )
  const [preferZh, setPreferZh] = React.useState(true)
  const [view, setView] = React.useState<"list" | "reader">("list")

  const filtered = items.filter((item) => {
    if (shelf !== "all" && item.source_type !== shelf) return false
    if (!q.trim()) return true
    const needle = q.trim().toLowerCase()
    const hay = [
      item.title,
      item.title_zh,
      item.summary,
      item.summary_zh,
      item.source_author,
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase()
    return hay.includes(needle)
  })

  const selected = items.find((r) => r.id === selectedId) ?? filtered[0] ?? null

  const open = (id: string) => {
    setSelectedId(id)
    setView("reader")
  }

  return (
    <Desk objects={["pencil", "clips"]} seed="dsource-desk" className="min-h-svh">
      <div className="@container mx-auto w-full max-w-[78rem] px-4 pt-8 pb-16 sm:px-8 sm:pt-12">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-type text-sm tracking-[0.18em] text-ink-muted uppercase">Personal desk</p>
            <h1 className="font-script mt-1 text-5xl leading-none font-bold text-ink sm:text-6xl">
              DSource
              <span className="ml-3 font-sans text-2xl font-semibold text-ink-soft sm:text-3xl">源集</span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              把推特、视频、书籍、加密等领域里真正值得留下的东西，收在一张桌上。默认中文，也能翻原文。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sample ? (
              <StickyNote color="yellow" seed="sample-flag" className="max-w-[12rem] text-sm">
                本地样例库 · 发布后写入 Postgres
              </StickyNote>
            ) : null}
            <Button asChild variant="secondary" seed="admin-link">
              <Link href="/admin">后台</Link>
            </Button>
          </div>
        </header>

        <div
          data-view={view}
          className="group/hub grid gap-6 @4xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]"
        >
          <Notebook
            stock="pad"
            seed="shelf"
            className="group-data-[view=reader]/hub:@max-4xl:hidden"
            aria-label="资源书架"
          >
            <div className="flex h-full min-h-[28rem] flex-col gap-3 p-3 sm:p-4">
              <Tabs value={shelf} onValueChange={setShelf}>
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                  {SHELVES.map((s) => (
                    <TabsTrigger key={s.id} value={s.id} className="text-sm">
                      {s.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索标题、作者、标签…"
                seed="search"
                aria-label="搜索"
              />
              <ScrollArea className="min-h-0 flex-1 pr-2">
                <div className="flex flex-col gap-2 pb-2">
                  {filtered.map((item) => {
                    const active = item.id === selected?.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => open(item.id)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "text-left transition-transform hover:-rotate-0.5",
                          active && "relative z-[1]",
                        )}
                      >
                        <IndexCard
                          seed={item.id}
                          className={cn(
                            "min-h-0 w-full max-w-none p-3 leading-snug",
                            active && "ring-2 ring-ink/30",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="secondary" className="text-[11px]">
                              {SOURCE_TYPE_LABELS[item.source_type] ?? item.source_type}
                            </Badge>
                            {item.featured ? <Stamp text="精选" seed={`${item.id}-feat`} size={56} /> : null}
                          </div>
                          <p className="mt-2 font-medium text-ink">{displayTitle(item)}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                            {displaySummary(item)}
                          </p>
                          <p className="mt-2 text-xs text-pencil-text">
                            {item.source_author || "未署名"} · {relativeTime(item.updated_at)}
                          </p>
                        </IndexCard>
                      </button>
                    )
                  })}
                  {filtered.length === 0 ? (
                    <p className="px-2 py-8 text-center text-sm text-ink-muted">这一格还是空的。</p>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          </Notebook>

          {selected ? (
            <Paper
              as="article"
              stock="card"
              seed={`reader-${selected.id}`}
              className="group-data-[view=list]/hub:@max-4xl:hidden"
              aria-label="阅读区"
            >
              <div className="flex flex-col gap-5 p-5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="@4xl:hidden"
                    onClick={() => setView("list")}
                    seed="back"
                  >
                    ← 书架
                  </Button>
                  <Badge>{SOURCE_TYPE_LABELS[selected.source_type] ?? selected.source_type}</Badge>
                  {selected.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={preferZh ? "default" : "secondary"}
                      onClick={() => setPreferZh(true)}
                      seed="zh"
                    >
                      中文
                    </Button>
                    <Button
                      size="sm"
                      variant={!preferZh ? "default" : "secondary"}
                      onClick={() => setPreferZh(false)}
                      seed="orig"
                    >
                      原文
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="font-script text-3xl leading-tight font-bold text-balance text-ink sm:text-4xl">
                    {displayTitle(selected, preferZh)}
                  </h2>
                  <p className="mt-2 text-sm text-ink-muted">
                    {selected.source_author || "未署名"}
                    {selected.source_url && isSafeHttpUrl(selected.source_url) ? (
                      <>
                        {" · "}
                        <a
                          href={selected.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-link underline-offset-2 hover:underline"
                        >
                          打开来源
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>

                <p className="border-l-2 border-rule-red/70 pl-4 text-[15px] leading-relaxed text-ink-soft">
                  {displaySummary(selected, preferZh)}
                </p>

                {selected.media_urls?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.media_urls.filter(isSafeHttpUrl).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="max-h-[28rem] w-full rounded-sm border border-pencil-mark/40 object-contain bg-photo"
                      />
                    ))}
                  </div>
                ) : null}

                <div className="prose-loose max-w-none">
                  {renderBody(displayBody(selected, preferZh))}
                </div>
              </div>
            </Paper>
          ) : (
            <Paper as="section" stock="card" className="grid min-h-[28rem] place-items-center">
              <Empty seed="empty-shelf">
                <EmptyHeader>
                  <EmptyMedia pose="idle" size={104} />
                  <EmptyTitle>还没有纸片</EmptyTitle>
                  <EmptyDescription>去后台贴一张，或先看看样例内容。</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Paper>
          )}
        </div>
      </div>
    </Desk>
  )
}
