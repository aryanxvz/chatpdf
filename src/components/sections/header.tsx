import { DarkModeToggle } from "../ui/theme-button"
import Link from "next/link"

export default function Header() {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 shadow-md">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl w-full">
        <div className="flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold text-foreground">chatpdf</span>
          </Link>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}