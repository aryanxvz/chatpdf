import { DarkModeToggle } from "../ui/theme-button"

export default function Header() {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="flex h-20 items-center justify-between px-6 lg:px-12 shadow-xl">
        <span className="text-3xl font-bold">ChatPDF</span>
        <span><DarkModeToggle /></span>
      </div>
    </div>
  )
}