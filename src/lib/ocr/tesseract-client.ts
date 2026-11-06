"use client"

import type { OcrProvider, OcrResult } from "@/lib/ocr/types"

/**
 * Free, keyless OCR via Tesseract.js (WASM in the browser).
 * Default langs: Simplified Chinese + English.
 */
export const tesseractClientOcr: OcrProvider = {
  id: "tesseract.js",
  async recognize(image, langs = ["chi_sim", "eng"]): Promise<OcrResult> {
    const { createWorker } = await import("tesseract.js")
    const worker = await createWorker(langs.join("+"))
    try {
      const { data } = await worker.recognize(image)
      return { text: (data.text || "").trim(), provider: "tesseract.js" }
    } finally {
      await worker.terminate()
    }
  },
}

/** Default provider used by admin; swap to OCR.space later behind the same interface. */
export const defaultOcrProvider: OcrProvider = tesseractClientOcr
