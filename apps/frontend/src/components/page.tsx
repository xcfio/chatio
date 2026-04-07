import { Footer } from "./footer"
import { cn } from "@/lib/utils"

export function Page({
    children,
    className,
    footer = true,
    ...prop
}: React.ComponentProps<"div"> & { footer?: boolean }) {
    return (
        <>
            <main>
                <div className={cn("min-h-full min-w-full", className)} {...prop}>
                    {children}
                </div>
            </main>
            {footer && <Footer />}
        </>
    )
}
