"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Page } from "@/components/page"
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { Static } from "typebox"
import { AuthenticatedUser, Conversation, Message, PublicUser } from "schema"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { AlertCircleIcon, LoaderCircle } from "lucide-react"
import { ftc } from "@/lib/fetch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Value from "typebox/value"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const UserContext = createContext<{
    user: Static<typeof AuthenticatedUser> | null
    setUser: Dispatch<SetStateAction<Static<typeof AuthenticatedUser> | null>>
} | null>(null)

export const CurrentConversationContext = createContext<{
    conversation: Static<typeof Conversation> | null
    setConversation: Dispatch<SetStateAction<Static<typeof Conversation> | null>>
} | null>(null)

export const ConversationsContext = createContext<{
    conversations: Array<Static<typeof Conversation>> | null
    setConversations: Dispatch<SetStateAction<Array<Static<typeof Conversation>> | null>>
} | null>(null)

export const MessageContext = createContext<{
    messages: Array<Static<typeof Message>>
    setMessages: Dispatch<SetStateAction<Array<Static<typeof Message>>>>
} | null>(null)

export default () => {
    const [conversations, setConversations] = useState<Array<Static<typeof Conversation>> | null>(null)
    const [currentConversation, setCurrentConversation] = useState<Static<typeof Conversation> | null>(null)
    const [user, setUser] = useState<Static<typeof AuthenticatedUser> | null>(null)
    const [messages, setMessages] = useState<Array<Static<typeof Message>>>([])
    const [error, setError] = useState<string | null>(null)
    const [width, setWidth] = useState(globalThis.innerWidth)
    const [loading, setLoading] = useState<boolean>(true)
    const [isChat, setIsChat] = useState(false)

    useEffect(() => {
        const handler = () => setWidth(globalThis.innerWidth)
        window.addEventListener("resize", handler)
        return () => window.removeEventListener("resize", handler)
    }, [])

    useEffect(() => {
        const data = JSON.parse(globalThis.sessionStorage.getItem("user") ?? "{}")
        if (Value.Check(AuthenticatedUser, data)) return setUser(data)
        ftc.auth.me().then((x) => (typeof x === "string" ? setError(x) : setUser(x)))
    }, [])

    useEffect(() => {
        ftc.conversations
            .getAll()
            .then((res) => {
                typeof res === "string" ? setError(res) : setConversations(res)
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message || "An error occurred while fetching messages.")
            })
    }, [user])

    useEffect(() => {
        if (!currentConversation) return

        ftc.messages
            .getAll(currentConversation.id)
            .then((res) => {
                if (typeof res === "string") {
                    setError(res)
                } else {
                    setMessages(res)
                }
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message || "An error occurred while fetching messages.")
                setLoading(false)
            })
    }, [currentConversation])

    if (error) return <Error error={error} />
    if (loading) return <Loading />
    return (
        <UserContext.Provider value={{ user, setUser }}>
            <ConversationsContext.Provider value={{ conversations, setConversations }}>
                <CurrentConversationContext.Provider
                    value={{ conversation: currentConversation, setConversation: setCurrentConversation }}
                >
                    <MessageContext.Provider value={{ messages, setMessages }}>
                        {width >= 768 ? (
                            <Page footer={false} className="hidden md:block h-screen w-screen">
                                <ResizablePanelGroup orientation="horizontal" className="border">
                                    <ResizablePanel defaultSize="35%" minSize="20%">
                                        <User />
                                    </ResizablePanel>
                                    <ResizableHandle withHandle />
                                    <ResizablePanel defaultSize="65%" minSize="30%">
                                        <Chat />
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </Page>
                        ) : (
                            <Page footer={false} className="block md:hidden h-screen w-screen">
                                {isChat ? <Chat /> : <User />}
                            </Page>
                        )}
                    </MessageContext.Provider>
                </CurrentConversationContext.Provider>
            </ConversationsContext.Provider>
        </UserContext.Provider>
    )
}

function Chat() {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const messages = useContext(MessageContext)?.messages ?? []
    const user = useContext(UserContext)?.user ?? null

    if (error) return <Error error={error} />
    if (loading) return <Loading />

    if (!messages.length) {
        setLoading(false)
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start chatting.</p>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col gap-2 py-2">
            {messages.map((message) => {
                const isCurrentUser = message.sender === user?.id

                return (
                    <HoverCard key={message.id} openDelay={10} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <Card
                                className={cn(
                                    "block max-w-[45vw] px-3 py-2 mx-2",
                                    isCurrentUser
                                        ? "self-end bg-card-foreground text-card"
                                        : "self-start bg-card text-card-foreground"
                                )}
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

function User() {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const { conversations } = useContext(ConversationsContext) ?? {}
    const { user } = useContext(UserContext) ?? {}

    const [users, setUsers] = useState<Array<Static<typeof PublicUser>>>([])

    const retrieveUsers = async () => {
        const users = Array.from(new Set(conversations?.map((x) => x.participant)))
        const res = await ftc.user.getAll({ id: users })

        if (typeof res === "string") return setError(res)
        setUsers(res)
        setLoading(false)
    }

    useEffect(() => {
        retrieveUsers()
    }, [])

    if (error) return <Error error={error} />
    if (loading) return <Loading />

    return (
        <ScrollArea className="rounded-md">
            {users.map((user, index) => {
                return (
                    <div key={index} className="flex">
                        <Card
                            role="button"
                            className="flex flex-row items-center gap-2 p-2 hover:bg-card/50 cursor-pointer"
                        >
                            <Avatar>
                                {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                                <AvatarFallback>
                                    {user.name.includes(" ")
                                        ? user.name
                                              .split(" ")
                                              .map((w) => w[0])
                                              .join("")
                                              .slice(0, 2)
                                              .toUpperCase()
                                        : user.name?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                                {/* <AvatarBadge className="bg-green-600 dark:bg-green-800" /> */}
                            </Avatar>
                            <p>{user.name}</p>
                        </Card>
                    </div>
                )
            })}
        </ScrollArea>
    )
}

function Error({ error }: { error: string }) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Alert className="max-w-md rounded-xl" variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>An error occurred</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    )
}
function Loading({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex min-h-dvh w-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>{message}</span>
            </div>
        </div>
    )
}
