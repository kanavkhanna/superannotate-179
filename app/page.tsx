import { PackingListOrganizer } from "@/components/packing-list-organizer"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
      <div className="container mx-auto py-8 px-4">
        <header className="flex justify-between items-center mb-10 pt-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Trip Packing List
            </h1>
            <p className="text-muted-foreground mt-1">Organize your travel essentials</p>
          </div>
          <ThemeToggle />
        </header>
        <PackingListOrganizer />
      </div>
    </main>
  )
}

