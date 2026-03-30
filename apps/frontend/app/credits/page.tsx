import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ExternalLink } from "lucide-react"
import { Link } from "@/components/ui/link"
import { Page } from "@/components/page"

const tools = [
    { name: "Fastify", desc: "Backend framework", url: "https://fastify.dev" },
    { name: "Next.js", desc: "Frontend framework", url: "https://nextjs.org" },
    { name: "PostgreSQL", desc: "Database", url: "https://www.postgresql.org" },
    { name: "Drizzle ORM", desc: "Database ORM", url: "https://orm.drizzle.team" },
    { name: "TypeScript", desc: "Type safety", url: "https://typescriptlang.org" },
    { name: "Typebox", desc: "Schema validation", url: "https://sinclairzx81.github.io/typebox" },
    { name: "Socket.IO", desc: "Real-time communication", url: "https://socket.io" },
    { name: "Shadcn UI", desc: "UI primitives", url: "https://ui.shadcn.com/" },
    { name: "Tailwind CSS", desc: "Styling", url: "https://tailwindcss.com" },
    { name: "Turborepo", desc: "Monorepo tooling", url: "https://turbo.build" }
]

export default function CreditsPage() {
    return (
        <Page className="flex flex-col items-center justify-center px-4 py-16">
            <div className="max-w-3xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold">Credits</h1>
                    <p className="text-muted-foreground text-lg">
                        Chatio is made possible by these amazing projects and people.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Created By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Omar Faruk</p>
                                <p className="text-muted-foreground text-sm">Lead Developer</p>
                            </div>
                            <Link
                                href="https://github.com/xcfio"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                size="sm"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                    <path d="M9 18c-4.51 2-5-2-7-2" />
                                </svg>
                                GitHub
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Technologies</CardTitle>
                        <CardDescription>The core technologies powering Chatio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            {tools.map(({ name, desc, url }) => (
                                <Link
                                    key={name}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="ghost"
                                    className="justify-between h-auto p-3 text-left"
                                >
                                    <div>
                                        <p className="font-medium">{name}</p>
                                        <p className="text-muted-foreground text-xs">{desc}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Open Source</CardTitle>
                        <CardDescription>Chatio is open source and available under the MIT License</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link
                            href="https://github.com/xcfio/chatio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                <path d="M9 18c-4.51 2-5-2-7-2" />
                            </svg>
                            View on GitHub
                        </Link>
                    </CardContent>
                </Card>

                <div className="text-center text-muted-foreground text-sm">
                    <p>
                        Special thanks to all contributors and the open source community for making this project
                        possible.
                    </p>
                </div>
            </div>
        </Page>
    )
}
