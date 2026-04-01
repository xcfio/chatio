import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ExternalLink } from "lucide-react"
import { Link } from "@/components/ui/link"
import { Page } from "@/components/page"
import { Github } from "@/components/icon/github"

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
                                <Github className="h-4 w-4" />
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
                            <Github className="h-4 w-4" />
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
