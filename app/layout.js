import './globals.css'

export const metadata = {
  title: 'Job Manager',
  description: 'Manage the job openings shown on the company careers page.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
