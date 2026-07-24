import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata = {
  title: 'AI Resume Analyzer',
  description: 'AI-powered resume ATS optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${plusJakarta.variable}`} suppressHydrationWarning>
        <body className="bg-background text-foreground font-sans min-h-screen antialiased selection:bg-purple-500/30 selection:text-purple-600 dark:selection:text-purple-200 transition-colors duration-300">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}