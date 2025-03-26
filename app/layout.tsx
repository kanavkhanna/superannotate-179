import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Trip Packing List Organizer",
  description: "Organize your trip packing lists efficiently",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-right" closeButton richColors theme="system" duration={2000} expand={true} />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'