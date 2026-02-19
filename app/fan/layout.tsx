import { FanAuthProvider } from '@/lib/fan-auth-context'

export default function FanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FanAuthProvider>{children}</FanAuthProvider>
}