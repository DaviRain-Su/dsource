"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { defaultOcrProvider } from "@/lib/ocr"
import type { MediaItem } from "@/lib/media"

type Props = {
  value: MediaItem[]
  onChange: (next: MediaItem[]) => void
}

export function MediaEditor({ value, onChange }: Props) {
  const [ocrIndex, setOcrIndex] = React.useState<number | null>(null)
  const [ocrMsg, setOcrMsg] = React.useState("")

  const update = (index: number, patch: Partial<MediaItem>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const add = () =>
    onChange([...value, { url: "", alt: "", description: "", description_zh: "", role: "main" }])

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))

  const runOcr = async (index: number, file?: File | null) => {
    const row = value[index]
    if (!file && !row?.url) {
      setOcrMsg("请先填图片 URL，或选择本地图片")
      return
    }
    setOcrIndex(index)
    setOcrMsg("OCR 识别中（Tesseract.js，首次会下载中文模型）…")
    try {
      const source = file ?? row.url
      const result = await defaultOcrProvider.recognize(source, ["chi_sim", "eng"])
      update(index, {
        description: result.text,
        description_zh: result.text,
      })
      setOcrMsg(`已用 ${result.provider} 填入图中文字（可编辑）`)
    } catch (err) {
      setOcrMsg(err instanceof Error ? err.message : "OCR 失败")
    } finally {
      setOcrIndex(null)
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <Label>媒体（结构化）</Label>
        <Button type="button" size="xs" variant="secondary" seed="add-media" onClick={add}>
          加一张
        </Button>
      </div>
      {ocrMsg ? <p className="text-xs text-ink-you">{ocrMsg}</p> : null}
      {value.length === 0 ? (
        <p className="text-sm text-ink-muted">还没有媒体。可点「加一张」，或上传后自动 OCR。</p>
      ) : null}
      {value.map((row, index) => (
        <div
          key={`media-${index}`}
          className="grid gap-2 rounded-sm border border-pencil-mark/40 bg-slip/50 p-3 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label>图片 URL</Label>
            <Input
              value={row.url}
              seed={`media-url-${index}`}
              onChange={(e) => update(index, { url: e.target.value })}
              placeholder="/media/... 或 https://..."
            />
          </div>
          <div>
            <Label>Alt</Label>
            <Input
              value={row.alt ?? ""}
              seed={`media-alt-${index}`}
              onChange={(e) => update(index, { alt: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1">
              <Label htmlFor={`ocr-file-${index}`}>本地图 OCR</Label>
              <Input
                id={`ocr-file-${index}`}
                type="file"
                accept="image/*"
                seed={`media-file-${index}`}
                onChange={(e) => void runOcr(index, e.target.files?.[0] ?? null)}
              />
            </div>
            <Button
              type="button"
              size="xs"
              variant="secondary"
              seed={`ocr-url-${index}`}
              disabled={ocrIndex === index}
              onClick={() => void runOcr(index)}
            >
              {ocrIndex === index ? "识别中…" : "对 URL 跑 OCR"}
            </Button>
            <Button
              type="button"
              size="xs"
              variant="destructive"
              seed={`rm-media-${index}`}
              onClick={() => remove(index)}
            >
              删
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Label>图中文字（中文，可编辑）</Label>
            <Textarea
              value={row.description_zh ?? ""}
              rows={3}
              seed={`media-dzh-${index}`}
              onChange={(e) => update(index, { description_zh: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>图中文字（原文）</Label>
            <Textarea
              value={row.description ?? ""}
              rows={2}
              seed={`media-d-${index}`}
              onChange={(e) => update(index, { description: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
