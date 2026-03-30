import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Mail, FileText } from "lucide-react"
import { Link } from "@/components/ui/link"
import { Page } from "@/components/page"

const faq = [
    {
        question: "How do I reset my password?",
        answer: (
            <>
                Visit the{" "}
                <Link href="/forget" variant="link" className="h-auto p-0">
                    forgot password
                </Link>{" "}
                page and contact us from your registered email address.
            </>
        )
    },
    {
        question: "Is Chatio free to use?",
        answer: "Yes! Chatio is completely free and open source."
    },
    {
        question: "How do I report a bug?",
        answer: (
            <>
                You can report bugs by opening an issue on our{" "}
                <Link
                    href="https://github.com/xcfio/chatio/issues"
                    target="_blank"
                    variant="link"
                    className="h-auto p-0"
                >
                    GitHub repository
                </Link>{" "}
                or by messaging us on{" "}
                <Link
                    href="https://discord.com/invite/FaCCaFM74Q"
                    target="_blank"
                    variant="link"
                    className="h-auto p-0"
                >
                    Discord
                </Link>{" "}
                .
            </>
        )
    }
]

export default function SupportPage() {
    return (
        <Page className="flex flex-col items-center justify-center px-4 py-16">
            <div className="max-w-3xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold">Support</h1>
                    <p className="text-muted-foreground text-lg">Need help? We&apos;re here to assist you.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Discord Community
                            </CardTitle>
                            <CardDescription>
                                Join our Discord server for real-time support and community discussions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href="https://discord.com/invite/FaCCaFM74Q"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                className="w-full"
                            >
                                Join Discord
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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
                                    className="h-5 w-5"
                                >
                                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                    <path d="M9 18c-4.51 2-5-2-7-2" />
                                </svg>
                                GitHub Issues
                            </CardTitle>
                            <CardDescription>Report bugs or request features on our GitHub repository.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href="https://github.com/xcfio/chatio/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                className="w-full"
                            >
                                Open an Issue
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documentation
                            </CardTitle>
                            <CardDescription>Browse our documentation for guides and tutorials.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href="https://github.com/xcfio/chatio#readme"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                className="w-full"
                            >
                                View Docs
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email Support
                            </CardTitle>
                            <CardDescription>For private inquiries, reach out via email.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="mailto:omarfaruksxp@gmail.com" variant="outline" className="w-full">
                                Send Email
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible>
                        {faq.map((item) => (
                            <AccordionItem key={item.question} value={item.question}>
                                <AccordionTrigger>{item.question}</AccordionTrigger>
                                <AccordionContent>{item.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </Page>
    )
}
