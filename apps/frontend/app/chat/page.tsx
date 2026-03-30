"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Page } from "@/components/page"
import { ComponentProps, useEffect, useState } from "react"
import { Static } from "typebox"
import { Message } from "schema"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"

export default () => {
    return (
        <>
            <MinWidth768 />
            <MaxWidth768 />
        </>
    )
}

function MinWidth768() {
    return (
        <Page footer={false} className="hidden md:block h-screen w-screen">
            <ResizablePanelGroup orientation="horizontal" className="border">
                <ResizablePanel defaultSize="35%" minSize="20%">
                    <UserArea />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize="65%" minSize="30%">
                    <ChatArea />
                </ResizablePanel>
            </ResizablePanelGroup>
        </Page>
    )
}

function MaxWidth768() {
    const [isChat, setIsChat] = useState(true)

    return (
        <Page footer={false} className="block md:hidden h-screen w-screen">
            {isChat ? <ChatArea /> : <UserArea />}
        </Page>
    )
}

function ChatArea() {
    return (
        <>
            <ChatHeader />
            <ChatMessages />
            <ChatInput />
        </>
    )
}

function ChatHeader() {
    return <p></p>
}

function ChatMessages({ className = "", ...props }: ComponentProps<"div">) {
    const [userId, setUserId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Array<Static<typeof Message>>>([])

    useEffect(() => {
        try {
            const raw = globalThis.sessionStorage.getItem("user")
            if (!raw) return

            const parsed = JSON.parse(raw) as { id?: string }
            setUserId(parsed.id ?? null)
        } catch {
            setUserId(null)
        }
    }, [])

    return (
        <div className="flex w-full flex-col gap-2">
            {messages.map((message) => {
                const isCurrentUser = message.sender === userId

                return (
                    <HoverCard key={message.id} openDelay={10} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <Card
                                className={cn(
                                    "block max-w-[45vw] px-3 py-2 mx-2",
                                    isCurrentUser
                                        ? "self-end bg-card-foreground text-card"
                                        : "self-start bg-card text-card-foreground",
                                    className
                                )}
                                {...props}
                            >
                                {message.content}
                            </Card>
                        </HoverCardTrigger>
                        <HoverCardContent className="flex w-64 flex-col gap-0.5">
                            <p>Created At: {new Date(message.createdAt).toLocaleString()}</p>
                        </HoverCardContent>
                    </HoverCard>
                )
            })}
        </div>
    )
}

function ChatInput() {
    return <p></p>
}

function UserArea() {
    return (
        <>
            <h4 className="mb-4 text-sm leading-none font-medium">User area</h4>
            <ScrollArea className="rounded-md">
                <>
                    <div className="text-sm">User: 1</div>
                    <Separator className="my-2" />
                </>
                <>
                    <div className="text-sm">User: 2</div>
                    <Separator className="my-2" />
                </>
            </ScrollArea>
        </>
    )
}
function UserHeader() {}
function UserList() {}
function UserProfile() {}
