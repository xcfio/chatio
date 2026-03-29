import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const comfortaa = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
    title: "Chatio - Real-time Chat Application",
    description: "Real-time chat application with Next.js and Socket.IO",
    icons: { icon: "/favicon.svg" }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            <head>
                {process.env.NODE_ENV !== "development" && (
                    <script
                        defer
                        src="https://cool-xcfio.vercel.app/script.js"
                        data-website-id="7254c75e-d3bd-4c9a-ac98-dc5e45dde948"
                    ></script>
                )}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            try {
                                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#141414')
                                }
                                if (localStorage.layout) {
                                    document.documentElement.classList.add('layout-' + localStorage.layout)
                                }
                            } catch (_) {}
                        `
                    }}
                />
                <meta name="theme-color" content={"#ffffff"} />
            </head>

            <body className={`${comfortaa.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
