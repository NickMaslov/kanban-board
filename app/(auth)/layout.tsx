import { ThemeToggle } from '@/components/theme-toggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        {children}
      </main>
    </div>
  )
}
