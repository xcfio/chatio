import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MailIcon } from "lucide-react"
import { Page } from "@/components/page"
import Link from "next/link"

export default () => {
    return (
        <Page>
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-5">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex flex-row gap-2 items-center">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mt-0.5" />
                            </Link>
                            Forgot Password
                        </CardTitle>
                        <CardDescription>We don't have an automated password reset system yet.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground">
                            To reset your password, please contact us directly from your registered email address:
                        </p>
                        <a
                            href="mailto:omarfaruksxp@gmail.com"
                            className="flex items-end gap-2 text-sm font-medium underline underline-offset-4"
                        >
                            <MailIcon className="h-4 w-4" />
                            omarfaruksxp@gmail.com
                        </a>
                    </CardContent>
                </Card>
            </div>
        </Page>
    )
}
