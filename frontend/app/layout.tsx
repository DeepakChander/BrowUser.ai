import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'BrowUser.ai - Autonomous Browser Agent',
    description: 'The only AI that works across all your tabs. Automate your browser in real-time.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
