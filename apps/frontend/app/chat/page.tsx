"use client"

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthenticatedUser, Conversation, Message, PublicUser } from "schema"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertCircleIcon,
    HelpCircle,
    LoaderCircle,
    MessageCircle,
    MonitorIcon,
    MoonIcon,
    PaletteIcon,
    Search,
    Settings,
    Star,
    SunIcon,
    UserCircle
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Page } from "@/components/page"
import { ftc } from "@/lib/fetch"
import { cn } from "@/lib/utils"
import { Static } from "typebox"
import Value from "typebox/value"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Github } from "@/components/icon/github"

export const UserContext = createContext<
    [Static<typeof AuthenticatedUser> | null, Dispatch<SetStateAction<Static<typeof AuthenticatedUser> | null>>] | null
>(null)

export const CurrentConversationContext = createContext<
    [Static<typeof Conversation> | null, Dispatch<SetStateAction<Static<typeof Conversation> | null>>] | null
>(null)

export const ConversationsContext = createContext<
    | [Array<Static<typeof Conversation>> | null, Dispatch<SetStateAction<Array<Static<typeof Conversation>> | null>>]
    | null
>(null)

export const MessageContext = createContext<
    [Array<Static<typeof Message>>, Dispatch<SetStateAction<Array<Static<typeof Message>>>>] | null
>(null)

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
        <UserContext.Provider value={[user, setUser]}>
            <ConversationsContext.Provider value={[conversations, setConversations]}>
                <CurrentConversationContext.Provider value={[currentConversation, setCurrentConversation]}>
                    <MessageContext.Provider value={[messages, setMessages]}>
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
    const [messages] = useContext(MessageContext) ?? [[], () => {}]
    const [user] = useContext(UserContext) ?? [null, () => {}]

    if (!messages.length) {
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
    const [currentConversation, setCurrentConversation] = useContext(CurrentConversationContext) ?? [null, () => {}]
    const [conversations, setConversations] = useContext(ConversationsContext) ?? [[], () => {}]
    const [users, setUsers] = useState<Array<Static<typeof PublicUser>>>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    async function retrieveUsers() {
        const users = Array.from(new Set(conversations?.map((x) => x.participant)))
        const res = await ftc.user.getAll({ id: users })

        if (typeof res === "string") return setError(res)
        setUsers(res)
        setLoading(false)
    }

    async function handleConversationSelect(id: string) {
        const res = await ftc.conversations.getOne(id, "user")
        if (typeof res === "string") {
            return setError(res)
        }
        setCurrentConversation(res)
    }

    useEffect(() => {
        retrieveUsers()
    }, [])

    if (error) return <Error error={error} />
    if (loading) return <Loading />

    return (
        <div className="flex flex-col">
            <div className="bg-muted rounded-tl-md rounded-tr-md p-4">
                <div className="flex flex-row justify-between  mb-1">
                    <h1 className="font-comfortaa text-2xl mb-2.5 tracking-tight text-foreground">Chatio</h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings
                                    role="button"
                                    className="text-muted-foreground hover:text-muted-foreground/50"
                                />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <UserCircle />
                                    Account
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <PaletteIcon />
                                        Theme
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuGroup>
                                                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                                                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                                                    <DropdownMenuRadioItem value="light">
                                                        <SunIcon />
                                                        Light
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="dark">
                                                        <MoonIcon />
                                                        Dark
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="system">
                                                        <MonitorIcon />
                                                        System
                                                    </DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => router.push("/support")}>
                                    <HelpCircle />
                                    Support
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/credits")}>
                                    <Star />
                                    Credits
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => router.push("https://github.com/xcfio/chatio")}>
                                    <Github />
                                    GitHub
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("https://discord.com/invite/FaCCaFM74Q")}>
                                    <MessageCircle />
                                    Discord
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* <Separator className="my-2" /> */}
                <div className="relative">
                    <Input className="pr-10" placeholder="Search user..." />
                    <Search
                        role="button"
                        className="absolute scale-80 right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground/50"
                    />
                </div>
            </div>
            <ScrollArea className="rounded-md">
                {users.map((user, index) => {
                    return (
                        <div key={index} className="grid">
                            <Card
                                role="button"
                                className="flex flex-row items-center gap-2 p-2 m-2 hover:bg-card/50 cursor-pointer"
                                onClick={() => handleConversationSelect(user.id)}
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
        </div>
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
