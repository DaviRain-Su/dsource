"use client"

import * as React from "react"
import { InkProvider } from "@/lib/ink/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InkProvider tier="lo" density="comfortable" textures>
      {children}
    </InkProvider>
  )
}
