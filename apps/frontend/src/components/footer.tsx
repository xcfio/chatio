"use client"

import { MessageCircle, HelpCircle, Star, SunIcon, MoonIcon, MonitorIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Link } from "@/components/ui/link"
import { useTheme } from "next-themes"
import NextLink from "next/link"
import { Github } from "./icon/github"

export function Footer() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    return (
        <footer className="bg-card border-t border-border mt-16 relative z-10">
            <div className="max-w-6xl mx-auto px-8 pt-12 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-8">
                    {/* Brand */}
                    <div className="max-w-sm">
                        <h3 className="text-2xl font-bold mb-2">
                            <NextLink
                                href="/"
                                className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent max-w-36"
                            >
                                Chatio
                            </NextLink>
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            A modern real-time chat app built for simplicity. Connect with anyone, anywhere.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-base font-semibold text-foreground mb-2">Quick Links</h4>
                        <div className="flex flex-col">
                            <Link
                                href="/support"
                                variant="ghost"
                                className="justify-start gap-3 p-2 h-auto text-muted-foreground hover:text-foreground max-w-36"
                                aria-label="Get Support"
                            >
                                <HelpCircle className="h-5 w-5 shrink-0" /> Support
                            </Link>
                            <Link
                                href="/credits"
                                variant="ghost"
                                className="justify-start gap-3 p-2 h-auto text-muted-foreground hover:text-foreground max-w-36"
                                aria-label="View Credits"
                            >
                                <Star className="h-5 w-5 shrink-0" /> Credits
                            </Link>
                        </div>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-base font-semibold text-foreground mb-2">Connect</h4>
                        <div className="flex flex-col">
                            <Link
                                href="https://github.com/xcfio/chatio"
                                variant="ghost"
                                className="justify-start gap-3 p-2 h-auto text-muted-foreground hover:text-foreground max-w-36"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub Repository"
                            >
                                <Github className="h-5 w-5 shrink-0" />
                                GitHub
                            </Link>
                            <Link
                                href="https://discord.com/invite/FaCCaFM74Q"
                                variant="ghost"
                                className="justify-start gap-3 p-2 h-auto text-muted-foreground hover:text-foreground max-w-36"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Discord Server"
                            >
                                <MessageCircle className="h-5 w-5 shrink-0" /> Discord
                            </Link>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div>
                        <h4 className="text-base font-semibold text-foreground mb-2">Appearance</h4>
                        <div className="flex flex-col">
                            {[
                                { value: "light", label: "Light", icon: SunIcon },
                                { value: "dark", label: "Dark", icon: MoonIcon },
                                { value: "system", label: "System", icon: MonitorIcon }
                            ].map(({ value, label, icon: Icon }) => (
                                <Button
                                    key={value}
                                    variant="ghost"
                                    onClick={() => setTheme(value)}
                                    className="justify-start gap-3 p-2 h-auto text-muted-foreground hover:text-foreground max-w-36"
                                    aria-label={`Switch to ${label} theme`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="flex-1 text-left">{label}</span>
                                    {mounted && theme === value && <Check className="h-4 w-4" />}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-border pt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} Omar Faruk. See{" "}
                        <Link
                            href="/credits"
                            variant="link"
                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                        >
                            Credits
                        </Link>
                        {" for more information"}
                    </p>
                </div>
            </div>
        </footer>
    )
}
