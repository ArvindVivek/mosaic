import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NuqsAdapter>
      {children}
    </NuqsAdapter>
  )
}
