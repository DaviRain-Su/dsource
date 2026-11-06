export type OcrResult = {
  text: string
  provider: string
}

/** Swap implementations without touching admin UI. */
export type OcrProvider = {
  readonly id: string
  recognize(image: Blob | File | string, langs?: string[]): Promise<OcrResult>
}
