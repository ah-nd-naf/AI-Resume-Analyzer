import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

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
      <html lang="en">
        <body className="bg-slate-50 text-slate-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}