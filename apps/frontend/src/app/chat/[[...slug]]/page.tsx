"use client"

import {
    ComponentType,
    createContext,
    Dispatch,
    InputEvent,
    SetStateAction,
    SVGProps,
    SyntheticEvent,
    use,
    useContext,
    useEffect,
    useRef,
    useState
} from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AuthenticatedUser,
    ChangeUserEmail,
    ChangeUserInfo,
    ChangeUserPassword,
    Conversation,
    Message,
    MessageContent,
    PublicUser
} from "schema"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertCircleIcon,
    ArrowLeft,
    Copy,
    CopyIcon,
    Eye,
    EyeOff,
    HelpCircle,
    Home,
    Info,
    LoaderCircle,
    LogOut,
    MessageCircle,
    Monitor,
    MoonIcon,
    Palette,
    PencilIcon,
    Search,
    Send,
    SettingsIcon,
    Star,
    SunIcon,
    TrashIcon,
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Github } from "@/components/icon/github"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider
} from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Link } from "@/components/ui/link"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger
} from "@/components/ui/context-menu"
import { Textarea } from "@/components/ui/textarea"
import { getSocket } from "@/lib/socket"
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle
} from "@/components/ui/popover"

export const ChatContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([false, () => {}])
export const DialogContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([false, () => {}])

export const OnlineContext = createContext<[Set<string>, Dispatch<SetStateAction<Set<string>>>]>([new Set(), () => {}])
export const TypingContext = createContext<[Set<string>, Dispatch<SetStateAction<Set<string>>>]>([new Set(), () => {}])

export const UserContext = createContext<
    [Static<typeof AuthenticatedUser> | null, Dispatch<SetStateAction<Static<typeof AuthenticatedUser> | null>>] | null
>(null)

export const MembersContext = createContext<
    [Array<Static<typeof PublicUser>>, Dispatch<SetStateAction<Array<Static<typeof PublicUser>>>>] | null
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

export const avatarMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/svg+xml",
    "image/bmp",
    "image/heic"
])

export default ({ params }: any) => {
    const [conversations, setConversations] = useState<Array<Static<typeof Conversation>> | null>(null)
    const [currentConversation, setCurrentConversation] = useState<Static<typeof Conversation> | null>(null)
    const [user, setUser] = useState<Static<typeof AuthenticatedUser> | null>(null)
    const [messages, setMessages] = useState<Array<Static<typeof Message>>>([])
    const [members, setMembers] = useState<Array<Static<typeof PublicUser>>>([])
    const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
    const [online, setOnline] = useState<Set<string>>(new Set())
    const [typing, setTyping] = useState<Set<string>>(new Set())
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [isChat, setIsChat] = useState(false)
    const { slug: [slug] = [] } = use(params) as { slug?: [string] }
    const [width, setWidth] = useState(globalThis.innerWidth)

    useEffect(() => {
        const handler = () => setWidth(globalThis.innerWidth)
        window.addEventListener("resize", handler)
        return () => window.removeEventListener("resize", handler)
    }, [])

    useEffect(() => {
        const data = JSON.parse(globalThis.sessionStorage.getItem("user") ?? "{}")
        if (Value.Check(AuthenticatedUser, data)) return setUser(data)
        ftc.auth.me().then((res) => {
            if (typeof res === "string") {
                if (res === "Authentication failed") return (globalThis.location.href = "/")
                setError(res)
            } else {
                setUser(res)
            }
        })
    }, [])

    useEffect(() => {
        ftc.conversations
            .getAll()
            .then((res) => {
                if (typeof res === "string") {
                    setError(res)
                    setLoading(false)
                } else {
                    setConversations(res)
                    retrieveMembers(res)
                }
            })
            .catch((err) => {
                setError(err.message || "An error occurred while fetching messages.")
                setLoading(false)
            })
    }, [user])

    async function retrieveMembers(conversations: Array<Static<typeof Conversation>>) {
        const users = Array.from(new Set(conversations.map((x) => x.participant)))
        if (!users.length) {
            setLoading(false)
            return setMembers([])
        }
        const res = await ftc.user.getAll({ id: users })
        if (typeof res === "string") return setError(res)
        setLoading(false)
        setMembers(res)
    }

    useEffect(() => {
        if (!slug || !conversations) return

        const conversation = conversations.find((x) => x.id === slug)
        if (conversation) {
            setCurrentConversation(conversation)
            setIsChat(true)
        }
    }, [slug, conversations])

    useEffect(() => {
        if (!user) return
        const socket = getSocket()

        socket.on("message_created", (message, conversationId) => {
            if (currentConversation?.id !== conversationId) return
            setMessages((prev) => {
                if (prev.some((x) => x.id === message.id)) return prev
                return [...prev, message]
            })
        })

        socket.on("message_edited", (message, conversationId) => {
            if (currentConversation?.id !== conversationId) return
            setMessages((prev) => prev.map((msg) => (msg.id === message.id ? message : msg)))
        })

        socket.on("message_deleted", (messageId, conversationId) => {
            if (currentConversation?.id !== conversationId) return
            setMessages((x) => x.filter((y) => y.id !== messageId))
        })

        socket.on("user_status_changed", (user, status) => {
            switch (status) {
                case "online": {
                    setOnline((x) => new Set(x).add(user))
                    break
                }
                case "offline": {
                    setOnline((x) => new Set([...x].filter((y) => y !== user)))
                    break
                }
            }
        })

        socket.on("typing", (user, conversation, status) => {
            const key = `${conversation}:${user}`
            switch (status) {
                case "started": {
                    setTyping((x) => new Set(x).add(key))
                    break
                }
                case "stopped": {
                    setTyping((x) => new Set([...x].filter((y) => y !== key)))
                    break
                }
            }
        })
    }, [user, currentConversation])

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
        <ChatContext.Provider value={[isChat, setIsChat]}>
            <DialogContext.Provider value={[isDialogOpen, setDialogOpen]}>
                <UserContext.Provider value={[user, setUser]}>
                    <MembersContext.Provider value={[members, setMembers]}>
                        <ConversationsContext.Provider value={[conversations, setConversations]}>
                            <CurrentConversationContext.Provider value={[currentConversation, setCurrentConversation]}>
                                <MessageContext.Provider value={[messages, setMessages]}>
                                    <OnlineContext.Provider value={[online, setOnline]}>
                                        <TypingContext.Provider value={[typing, setTyping]}>
                                            <>
                                                <Settings />
                                                <Toaster />
                                            </>
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
                                        </TypingContext.Provider>
                                    </OnlineContext.Provider>
                                </MessageContext.Provider>
                            </CurrentConversationContext.Provider>
                        </ConversationsContext.Provider>
                    </MembersContext.Provider>
                </UserContext.Provider>
            </DialogContext.Provider>
        </ChatContext.Provider>
    )
}

function Chat() {
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [currentConversation] = useContext(CurrentConversationContext) ?? [null, () => {}]
    const [conversation] = useContext(CurrentConversationContext) ?? [null, () => {}]
    const [messages, setMessages] = useContext(MessageContext) ?? [[], () => {}]
    const [_, setIsChat] = useContext(ChatContext) ?? [[], () => {}]
    const [members] = useContext(MembersContext) ?? [[], () => {}]
    const [online] = useContext(OnlineContext) ?? [[], () => {}]
    const [typing] = useContext(TypingContext) ?? [[], () => {}]
    const [user] = useContext(UserContext) ?? [null, () => {}]
    let isTyping = false

    const opponent = members.find((m) => m.id === conversation?.participant)
    const displayName = opponent?.name ?? user?.name ?? "Unknown User"

    async function sendMessage(form: FormData) {
        const content = Object.fromEntries(form.entries()).message

        if (!Value.Check(MessageContent, content)) {
            const errors = [...Value.Errors(MessageContent, content)]
            const message = errors.map((e: any) => `${e.path ?? "Form"}: ${e.message}`).join(", ")
            tx("error", "Validation failed", message)
            return
        }

        const output = await ftc.messages.send(currentConversation?.id ?? "", content)
        if (typeof output === "string") {
            tx("error", "Sending message failed", output)
            return
        } else {
            setMessages((prev) => [...prev, output])
            return
        }
    }

    async function editMessage(id: string, content: string) {
        console.log(content)
        if (!Value.Check(MessageContent, content)) {
            const errors = [...Value.Errors(MessageContent, content)]
            const message = errors.map((e: any) => `${e.path ?? "Form"}: ${e.message}`).join(", ")
            tx("error", "Validation failed", message)
            return
        }
        const output = await ftc.messages.edit(id, content)
        if (typeof output === "string") {
            tx("error", "Editing message failed", output)
            return
        } else {
            setMessages((prev) => prev.map((m) => (m.id === id ? output : m)))
            tx("success", "Message edited", "Your message has been updated.")
            return
        }
    }

    async function deleteMessage(id: string) {
        const output = await ftc.messages.delete(id)
        if (typeof output === "string") {
            tx("error", "Deleting message failed", output)
            return
        } else {
            setMessages((prev) => prev.filter((m) => m.id !== id))
            tx("success", "Message deleted", "Your message has been deleted.")
            return
        }
    }

    if (!currentConversation) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start chatting.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="flex items-center gap-4 rounded-b-2xl bg-muted p-4">
                <Button variant="ghost" className="md:hidden px-2 text-foreground/50" onClick={() => setIsChat(false)}>
                    <ArrowLeft className="scale-140" />
                    <span className="sr-only">Back</span>
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                            <Avatar className="scale-130 md:ml-1">
                                {opponent?.avatar && <AvatarImage src={opponent.avatar} alt={displayName} />}
                                <AvatarFallback>{fallback(displayName)}</AvatarFallback>
                                {online.has(opponent?.id ?? "") && (
                                    <AvatarBadge className="bg-green-600 dark:bg-green-800 ring-0" />
                                )}
                            </Avatar>
                            <span className="font-comfortaa tracking-tight">{displayName}</span>
                        </button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
                        <DialogHeader className="sr-only">
                            <DialogTitle>User Profile</DialogTitle>
                        </DialogHeader>

                        {/* Banner */}
                        <div className="h-18 bg-muted relative border-b border-border">
                            <div className="absolute -bottom-7 left-5">
                                <div className="relative">
                                    <Avatar className="size-14 ring-3 ring-background">
                                        {opponent?.avatar && <AvatarImage src={opponent.avatar} alt={displayName} />}
                                        <AvatarFallback className="text-lg">{fallback(displayName)}</AvatarFallback>
                                    </Avatar>
                                    {online.has(opponent?.id ?? "") && (
                                        <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-green-500 ring-2 ring-background" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="pt-10 px-5 pb-5">
                            <p className="font-comfortaa font-semibold text-base leading-tight">{opponent?.name}</p>
                            <p className="text-sm text-muted-foreground mb-4">@{opponent?.username}</p>

                            <div className="flex flex-col gap-2 mb-4">
                                {opponent?.gender && (
                                    <div className="bg-muted rounded-lg px-3 py-2.5">
                                        <p className="text-[11px] text-muted-foreground mb-0.5">Gender</p>
                                        <p className="text-[13px] font-medium capitalize">{opponent.gender}</p>
                                    </div>
                                )}
                                <div className="bg-muted rounded-lg px-3 py-2.5">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-[11px] text-muted-foreground">User ID</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(opponent?.id ?? "")
                                                tx(
                                                    "success",
                                                    "Copied to clipboard",
                                                    "User ID has been copied to clipboard."
                                                )
                                            }}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Copy className="size-3" />
                                        </button>
                                    </div>
                                    <p className="text-[13px] font-mono">{opponent?.id}</p>
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2.5">
                                    <p className="text-[11px] text-muted-foreground mb-0.5">Joined</p>
                                    <p className="text-[13px] font-medium">
                                        {new Date(opponent?.createdAt ?? "").toLocaleString("en-US", {
                                            dateStyle: "medium",
                                            timeStyle: "short"
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {typing.has(`${currentConversation?.id ?? ""}:${opponent?.id ?? ""}`) && (
                    <span className="not-sr-only flex items-center gap-0.5">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </span>
                )}
            </div>

            {messages.length ? (
                <ScrollArea className="flex-1 min-h-0 w-full px-2 py-0">
                    {messages.flat().map((message) => (
                        <MessageComponent
                            key={message.id}
                            message={message}
                            members={members}
                            user={user}
                            editMessage={editMessage}
                            deleteMessage={deleteMessage}
                        />
                    ))}
                </ScrollArea>
            ) : (
                <div className="flex flex-1 min-h-0 w-full items-center justify-center m-auto md:pb-30">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
            )}

            <form action={sendMessage} className="mt-auto bg-muted px-4 py-3 mx-auto flex w-full items-end gap-2">
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Type a message..."
                    minLength={1}
                    maxLength={2000}
                    required
                    rows={1}
                    className="min-h-0 resize-none overflow-hidden leading-relaxed pb-2 pt-1"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            e.currentTarget.form?.requestSubmit()
                        }
                    }}
                    onInput={(e) => {
                        const el = e.currentTarget
                        el.style.height = "auto"
                        el.style.height = `${el.scrollHeight}px`

                        if (!isTyping) {
                            isTyping = true
                            const socket = getSocket()
                            socket.emit("typing", currentConversation?.id ?? "", "started")
                        }

                        if (typingTimeout.current) clearTimeout(typingTimeout.current)
                        typingTimeout.current = setTimeout(() => {
                            isTyping = false
                            const socket = getSocket()
                            socket.emit("typing", currentConversation?.id ?? "", "stopped")
                        }, 1500)
                    }}
                    onPointerOut={(e) => {
                        const el = e.currentTarget
                        el.style.height = "auto"
                        el.style.height = `${el.scrollHeight}px`
                    }}
                />
                <Button type="submit" size="icon" className="shrink-0 mb-0.5">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
    )
}

function MessageComponent({
    user,
    members,
    message,
    editMessage,
    deleteMessage
}: {
    message: Static<typeof Message>
    members: Array<Static<typeof PublicUser>>
    user: Static<typeof AuthenticatedUser> | null
    editMessage: (id: string, content: string) => Promise<void>
    deleteMessage: (id: string) => Promise<void>
}) {
    const [online] = useContext(OnlineContext) ?? [new Set(), () => {}]
    const [isDetailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [isEditDialogOpen, setEditDialogOpen] = useState(false)

    const sender = members.find((u) => u.id === message.sender)
    const isCurrentUser = message.sender === user?.id

    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = message.content.split(urlRegex)

    return (
        <div className={cn("py-1 w-full flex", isCurrentUser ? "justify-end" : "justify-start")} key={message.id}>
            {!isCurrentUser && (
                <Avatar className="block scale-115 ml-1 mr-2 shrink-0 self-center">
                    {sender?.avatar && <AvatarImage src={sender.avatar} />}
                    <AvatarFallback className="text-[10px]">{fallback(sender?.name ?? "N/A")}</AvatarFallback>
                    {online.has(sender?.id ?? "") && <AvatarBadge className="bg-green-600 dark:bg-green-800 ring-0" />}
                </Avatar>
            )}

            <ContextMenu>
                <ContextMenuTrigger>
                    <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <div
                                className={cn(
                                    "group relative max-w-[65vw] md:max-w-[45vw] px-4 py-2.5 rounded-2xl text-sm leading-relaxed cursor-default select-text",
                                    "transition-opacity duration-150",
                                    isCurrentUser
                                        ? "rounded-br-sm bg-primary text-primary-foreground"
                                        : "rounded-bl-sm bg-muted text-foreground"
                                )}
                            >
                                <p className="whitespace-pre-wrap wrap-break-word">
                                    {parts.map((part, i) =>
                                        urlRegex.test(part) ? (
                                            <a
                                                key={i}
                                                href={part}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline underline-offset-2 opacity-90 hover:opacity-100"
                                            >
                                                {part}
                                            </a>
                                        ) : (
                                            part
                                        )
                                    )}
                                </p>
                                {message.updatedAt && message.updatedAt !== message.createdAt && (
                                    <span className="ml-1.5 text-[10px] opacity-50 italic">edited</span>
                                )}
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent
                            side={isCurrentUser ? "left" : "right"}
                            align="center"
                            className="w-56 p-3 text-xs space-y-1"
                        >
                            {!isCurrentUser && (
                                <p className="font-medium text-foreground">{sender?.name ?? "Unknown User"}</p>
                            )}
                            <p className="text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</p>
                            {message.updatedAt && message.updatedAt !== message.createdAt && (
                                <p className="text-muted-foreground">
                                    Edited {new Date(message.updatedAt).toLocaleString()}
                                </p>
                            )}
                        </HoverCardContent>
                    </HoverCard>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44">
                    <ContextMenuGroup>
                        <ContextMenuItem className="gap-2">
                            <CopyIcon className="h-3.5 w-3.5" /> Copy
                        </ContextMenuItem>
                        {isCurrentUser && (
                            <ContextMenuItem className="gap-2" onClick={() => setEditDialogOpen(true)}>
                                <PencilIcon className="h-3.5 w-3.5" />
                                Edit
                            </ContextMenuItem>
                        )}
                    </ContextMenuGroup>
                    {isCurrentUser && (
                        <>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                variant="destructive"
                                className="gap-2"
                                onClick={() => deleteMessage(message.id)}
                            >
                                <TrashIcon className="h-3.5 w-3.5" /> Delete
                            </ContextMenuItem>
                        </>
                    )}
                    <ContextMenuItem className="gap-2" onClick={() => setDetailsDialogOpen(true)}>
                        <Info className="h-3.5 w-3.5" /> Details
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Message</DialogTitle>
                        <DialogDescription>Modify the content of your message.</DialogDescription>
                        <form
                            className="flex pt-2"
                            action={(form) => {
                                editMessage(message.id, Object.fromEntries(form.entries()).EditedContent as string)
                                setEditDialogOpen(false)
                            }}
                        >
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="EditedContent">Message</FieldLabel>
                                    <Textarea
                                        id="EditedContent"
                                        name="EditedContent"
                                        placeholder="Enter your new content"
                                        defaultValue={message.content}
                                        maxLength={2000}
                                        minLength={1}
                                        rows={1}
                                        required
                                        onPointerEnter={(e) => {
                                            const el = e.currentTarget
                                            el.style.height = "auto"
                                            el.style.height = `${el.scrollHeight}px`
                                        }}
                                        onInput={(e) => {
                                            const el = e.currentTarget
                                            el.style.height = "auto"
                                            el.style.height = `${el.scrollHeight}px`
                                        }}
                                    />
                                </Field>
                                <Field orientation="horizontal">
                                    <Button type="submit">Edit</Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Dialog open={isDetailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Message Details</DialogTitle>
                        <DialogDescription>Information about this message</DialogDescription>
                    </DialogHeader>
                    <div className="text-sm space-y-2">
                        {!isCurrentUser && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sender</span>
                                <span>{sender?.name ?? "Unknown"}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sent</span>
                            <span>{new Date(message.createdAt).toLocaleString()}</span>
                        </div>
                        {message.updatedAt && message.updatedAt !== message.createdAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Edited</span>
                                <span>{new Date(message.updatedAt).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Message ID</span>
                            <span className="font-mono text-xs text-muted-foreground">{message.id}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function User() {
    const [_, setCurrentConversation] = useContext(CurrentConversationContext) ?? [null, () => {}]
    const [conversations] = useContext(ConversationsContext) ?? [null, () => {}]
    const [online] = useContext(OnlineContext) ?? [new Set(), () => {}]
    const [___, setIsChat] = useContext(ChatContext) ?? [[], () => {}]
    const [members] = useContext(MembersContext) ?? [[], () => {}]
    const [error, setError] = useState<string | null>(null)
    const [isPopoverOpen, setPopoverOpen] = useState(false)
    const [searchResults, setSearchResults] = useState<Array<Static<typeof PublicUser>>>([])

    async function handleConversationSelect(id: string) {
        const res = await ftc.conversations.getOne(id, "user")
        if (typeof res === "string") return setError(res)

        setCurrentConversation(res)
        window.history.replaceState(null, "", `/chat/${res.id}`)

        setIsChat(true)
    }

    async function createConversation(id: string) {
        if (conversations?.find((x) => x.participant === id)) return await handleConversationSelect(id)
        const res = await ftc.conversations.create(id)

        if (typeof res === "string") return tx("error", "Creating conversation failed", res)
        setCurrentConversation(res)

        window.history.replaceState(null, "", `/chat/${res.id}`)
        setIsChat(true)
    }

    if (error) return <Error error={error} />

    return (
        <div className="flex h-full flex-col justify-start">
            <div className="bg-muted rounded-b-md p-4">
                <div className="flex flex-row justify-between mb-1">
                    <h1 className="font-comfortaa text-2xl mb-2.5 tracking-tight text-foreground">Chatio</h1>
                    <Dropdown />
                </div>

                <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                    <div className="relative">
                        <PopoverAnchor asChild>
                            <Input
                                className="pr-10"
                                placeholder="Search user..."
                                onInput={async (event) => {
                                    event.preventDefault()
                                    const value = event.currentTarget.value

                                    const user = await ftc.user.getAll({ search: value })
                                    if (typeof user === "string") return tx("error", user)

                                    setPopoverOpen(!!value)
                                    setSearchResults(user)
                                }}
                            />
                        </PopoverAnchor>
                        <Search className="absolute scale-80 right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground/50" />
                    </div>

                    <PopoverContent
                        align="start"
                        className="p-1.5 w-64 shadow-lg bg-background"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <p className="sr-only">Matching users will appear here.</p>
                        <ScrollArea className="p-1">
                            {searchResults.length > 0 ? (
                                searchResults.map((user, index) => {
                                    return (
                                        <Card
                                            key={user.id}
                                            role="button"
                                            className={`flex flex-row items-center bg-card gap-2 py-1 px-1.5 rounded-full hover:bg-card/50 cursor-pointer ${index === 0 ? "" : "mt-2.5"}`}
                                            onClick={() => createConversation(user.id)}
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
                                                {online.has(user.id) && (
                                                    <AvatarBadge className="bg-green-600 dark:bg-green-800 ring-0" />
                                                )}
                                            </Avatar>
                                            <p>{user.name}</p>
                                        </Card>
                                    )
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 gap-1.5 text-center">
                                    <Search className="h-4 w-4 text-muted-foreground/40" />
                                    <p className="text-xs text-muted-foreground">No users found</p>
                                </div>
                            )}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>
            {members.length ? (
                <ScrollArea>
                    {members.map((user) => {
                        return (
                            <Card
                                key={user.id}
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
                                    {online.has(user.id) && (
                                        <AvatarBadge className="bg-green-600 dark:bg-green-800 ring-0" />
                                    )}
                                </Avatar>
                                <p>{user.name}</p>
                            </Card>
                        )
                    })}
                </ScrollArea>
            ) : (
                <div className="flex items-center justify-center m-auto md:pb-30">
                    <p className="text-muted-foreground">Find a user to chat with.</p>
                </div>
            )}
        </div>
    )
}

function Dropdown() {
    const [open, setOpen] = useContext(DialogContext) ?? [false, () => {}]
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    async function logout() {
        await ftc.auth.logout()
        globalThis.sessionStorage.removeItem("user")
        router.push("/")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <SettingsIcon role="button" className="text-muted-foreground hover:text-muted-foreground/50" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={logout}>
                        <LogOut />
                        Logout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(!open)}>
                        <UserCircle />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Palette />
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
                                            <Monitor />
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
    )
}

function Settings() {
    const [activeTab, setActiveTab] = useState<"profile" | "account">("profile")
    const [open, setOpen] = useContext(DialogContext) ?? [false, () => {}]

    const sections: Array<{ id: "profile" | "account"; title: string; icon: ComponentType<SVGProps<SVGSVGElement>> }> =
        [
            { id: "profile", title: "Profile", icon: UserCircle },
            { id: "account", title: "Account", icon: Home }
        ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden p-0 max-h-[85dvh] md:max-h-125 md:max-w-175 lg:max-w-200">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <DialogDescription className="sr-only">Customize your settings here.</DialogDescription>
                <SidebarProvider className="items-start min-h-full">
                    <Sidebar collapsible="none" className="hidden md:flex">
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {sections.map((item) => (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    onClick={() => setActiveTab(item.id)}
                                                    isActive={activeTab === item.id}
                                                >
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                    <main className="flex h-[70dvh] flex-1 flex-col overflow-hidden md:h-120">
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                            <div className="flex items-center gap-2">
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>
                                                {sections.find((section) => section.id === activeTab)?.title}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </header>
                        <div className="flex gap-2 border-b p-3 md:hidden">
                            {sections.map((item) => (
                                <Button
                                    key={item.id}
                                    type="button"
                                    size="sm"
                                    variant={activeTab === item.id ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <item.icon className="mr-1.5" />
                                    {item.title}
                                </Button>
                            ))}
                        </div>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                            {activeTab === "profile" && <SettingsProfile />}
                            {activeTab === "account" && <SettingsAccount />}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
    )
}

function SettingsProfile() {
    const [user, setUser] = useContext(UserContext) ?? [null, () => {}]
    const [gender, setGender] = useState<string>(user?.gender ?? "")
    const usernameRef = useRef<HTMLInputElement>(null)
    const avatarRef = useRef<HTMLInputElement>(null)

    async function profileUpdate(x: SyntheticEvent<HTMLFormElement>) {
        x.preventDefault()

        const form = new FormData(x.currentTarget)
        const data = Object.fromEntries(form.entries()) as Static<typeof ChangeUserInfo>

        if (!Value.Check(ChangeUserInfo, data)) {
            const errors = [...Value.Errors(ChangeUserInfo, data)]
            const message = errors.map((e: any) => `${e.path ?? "Form"}: ${e.message}`).join(", ")
            return tx("error", "Validation failed", message)
        }

        if (data.avatar) {
            try {
                const contentType = (await fetch(data.avatar)).headers.get("Content-Type") ?? ""

                if (!avatarMimeTypes.has(contentType)) {
                    return tx("error", "Validation failed", "Avatar URL must point to a valid image")
                }
            } catch (error) {
                console.log(error)
                return tx("error", "Validation failed", "Failed to fetch avatar image")
            }
        } else {
            delete data.avatar
        }

        const output = await ftc.auth.updateUser(data)
        if (typeof output === "string") {
            return tx("error", "Profile update failed", output)
        } else {
            setUser(output)
            window.sessionStorage.setItem("user", JSON.stringify(output))
            return tx("success", "Profile updated", `Your profile has been updated, ${output.name}!`)
        }
    }

    function isValidUrl(str: string) {
        try {
            new URL(str)
            return true
        } catch {
            return false
        }
    }

    function avatarCheck(event: InputEvent<HTMLInputElement>) {
        if (event.currentTarget.value && !isValidUrl(event.currentTarget.value)) {
            event.currentTarget.setCustomValidity("Please enter a valid image URL")
            event.currentTarget.setAttribute("aria-invalid", "true")
            avatarRef.current?.setAttribute("data-invalid", "true")
        } else {
            event.currentTarget.setCustomValidity("")
            event.currentTarget.setAttribute("aria-invalid", "false")
            avatarRef.current?.setAttribute("data-invalid", "false")
        }
    }

    function usernameCheck(event: InputEvent<HTMLInputElement>) {
        if (!/^[a-zA-Z][a-zA-Z0-9-]{2,11}$/.test(event.currentTarget.value)) {
            event.currentTarget.setCustomValidity(
                "Username must be 4-12 characters, start with a letter, and contain only letters, numbers, and hyphens (-)"
            )
            event.currentTarget.setAttribute("aria-invalid", "true")
            usernameRef.current?.setAttribute("data-invalid", "true")
        } else {
            event.currentTarget.setCustomValidity("")
            event.currentTarget.setAttribute("aria-invalid", "false")
            usernameRef.current?.setAttribute("data-invalid", "false")
        }
    }

    return (
        <>
            <h2 className="mb-4 text-lg font-semibold">Edit profile</h2>
            <form className="flex flex-col " onSubmit={profileUpdate}>
                <FieldGroup>
                    <Field className="flex flex-col gap-2">
                        <FieldLabel>Avatar preview</FieldLabel>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                {user?.avatar?.trim() && (
                                    <AvatarImage src={user.avatar.trim()} alt={user.username || user.name} />
                                )}
                                <AvatarFallback>
                                    {user?.name.includes(" ")
                                        ? user.name
                                              .split(" ")
                                              .map((w) => w[0])
                                              .join("")
                                              .slice(0, 2)
                                              .toUpperCase()
                                        : user?.name?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">
                                Set an image URL below to update your avatar.
                            </p>
                        </div>
                    </Field>
                    <Field ref={avatarRef}>
                        <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
                        <Input
                            id="avatar"
                            name="avatar"
                            placeholder="Enter your avatar URL"
                            title="Enter your avatar URL"
                            type="text"
                            defaultValue={user?.avatar ?? ""}
                            onInput={avatarCheck}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="name">Display name</FieldLabel>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Enter your name"
                            title="Enter your name"
                            required
                            defaultValue={user?.name}
                        />
                    </Field>
                    <Field ref={usernameRef}>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            required
                            onInput={usernameCheck}
                            defaultValue={user?.username}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="gender">Gender</FieldLabel>
                        <Select onValueChange={setGender} value={gender} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="gender" value={gender} />
                    </Field>
                    <Field orientation="horizontal">
                        <Button type="submit">Save profile</Button>
                    </Field>
                </FieldGroup>
            </form>
        </>
    )
}

function SettingsAccount() {
    const [user] = useContext(UserContext) ?? [null, () => {}]
    const router = useRouter()

    async function handleLogout() {
        const res = await ftc.auth.logout()
        if (typeof res === "string") {
            tx("error", res)
            return
        }

        globalThis.sessionStorage.removeItem("user")
        tx("success", "Logged out successfully.")
        setTimeout(() => {
            router.push("/")
        }, 1000)
    }

    return (
        <>
            <h2 className="mb-4 text-lg font-semibold">Account</h2>
            <div className="flex flex-row items-end gap-2">
                <div className="flex w-full flex-col gap-2">
                    <label htmlFor="emailPlaceholder" className="text-sm text-muted-foreground">
                        Email
                    </label>
                    <Input id="emailPlaceholder" value={user?.email} className="w-full" disabled />
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-15">
                            Edit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <ChangeEmail />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex flex-row items-end gap-2">
                <div className="flex w-full flex-col gap-2">
                    <label htmlFor="passwordPlaceholder" className="text-sm text-muted-foreground">
                        Password
                    </label>
                    <Input id="passwordPlaceholder" value="********" className="w-full" disabled />
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-15">
                            Edit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <ChangePassword />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => router.push("/support")}>
                    Contact support
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                    Log out
                </Button>
            </div>
        </>
    )
}

function ChangeEmail() {
    const [_, setUser] = useContext(UserContext) ?? [null, () => {}]
    const [showPassword, setShowPassword] = useState(false)
    const passwordRef = useRef<HTMLInputElement>(null)

    async function emailUpdate(form: FormData) {
        const data = Object.fromEntries(form.entries())

        if (!Value.Check(ChangeUserEmail, data)) {
            const errors = [...Value.Errors(ChangeUserEmail, data)]
            const message = errors.map((e: any) => `${e.path ?? "Form"}: ${e.message}`).join(", ")
            tx("error", "Validation failed", message)
            return
        }

        const output = await ftc.auth.changeEmail(data)
        if (typeof output === "string") {
            tx("error", "Changing email failed", output)
            return
        } else {
            setUser(output)
            window.sessionStorage.setItem("user", JSON.stringify(output))
            tx("success", "Email changed", `Your email has been updated to ${output.email}`)
            return
        }
    }

    return (
        <>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>Enter your new email address below.</DialogDescription>
            <form className="flex flex-col gap-4" action={emailUpdate}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="email">New Email</FieldLabel>
                        <Input id="email" name="email" placeholder="Enter your new email" type="email" required />
                    </Field>
                    <Field>
                        <div className="flex justify-between items-center">
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Link
                                type="button"
                                variant="link"
                                className="text-muted-foreground text-xs p-0 h-auto"
                                href="/forget"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                name="password"
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                required
                            />
                            <InputGroupAddon align="inline-end">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    aria-label="Show Your Password"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <Field orientation="horizontal">
                        <Button type="submit">Update Email</Button>
                    </Field>
                </FieldGroup>
            </form>
        </>
    )
}

function ChangePassword() {
    const [_, setUser] = useContext(UserContext) ?? [null, () => {}]
    const [showPassword, setShowPassword] = useState(false)
    const conformPasswordField = useRef<HTMLDivElement>(null)
    const passwordField = useRef<HTMLDivElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    async function passwordUpdate(form: FormData) {
        const data = Object.fromEntries(form.entries())

        if (data.newPassword !== data.confirmPassword) {
            tx("error", "Validation failed", "New password and confirm password do not match")
            return
        }

        if (!Value.Check(ChangeUserPassword, data)) {
            const errors = [...Value.Errors(ChangeUserPassword, data)]
            const message = errors.map((e: any) => `${e.path ?? "Form"}: ${e.message}`).join(", ")
            tx("error", "Validation failed", message)
            return
        }

        const output = await ftc.auth.changePassword(data)
        if (typeof output === "string") {
            tx("error", "Changing password failed", output)
            return
        } else {
            setUser(output)
            window.sessionStorage.setItem("user", JSON.stringify(output))
            tx("success", "Password changed", `Your password has been updated`)
            return
        }
    }

    function passwordCheck(event: InputEvent<HTMLInputElement>) {
        if (event.currentTarget.value !== passwordRef.current?.value) {
            event.currentTarget.setCustomValidity("Passwords do not match")
            passwordField.current?.setAttribute("data-invalid", "true")
            conformPasswordField.current?.setAttribute("data-invalid", "true")
        } else {
            event.currentTarget.setCustomValidity("")
            passwordField.current?.setAttribute("data-invalid", "false")
            conformPasswordField.current?.setAttribute("data-invalid", "false")
        }
    }

    return (
        <>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your new password below.</DialogDescription>
            <form className="flex flex-col gap-4" action={passwordUpdate}>
                <FieldGroup>
                    <Field>
                        <div className="flex justify-between items-center">
                            <FieldLabel htmlFor="oldPassword">Current Password</FieldLabel>
                            <Link
                                type="button"
                                variant="link"
                                className="text-muted-foreground text-xs p-0 h-auto"
                                href="/forget"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <InputGroup>
                            <InputGroupInput
                                id="oldPassword"
                                name="oldPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your current password"
                                required
                            />
                            <InputGroupAddon align="inline-end">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    aria-label="Show Your Password"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <Field ref={passwordField}>
                        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="newPassword"
                                name="newPassword"
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                minLength={6}
                                maxLength={30}
                                required
                            />
                            <InputGroupAddon align="inline-end">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    aria-label="Show Your Password"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <Field ref={conformPasswordField}>
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                minLength={6}
                                maxLength={30}
                                required
                                onInput={passwordCheck}
                            />
                            <InputGroupAddon align="inline-end">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    aria-label="Show Your Password"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <Field orientation="horizontal">
                        <Button type="submit">Update Password</Button>
                    </Field>
                </FieldGroup>
            </form>
        </>
    )
}

function tx(type: "success" | "error" | "warning" | "info", text: string, description?: string) {
    return toast[type](text, { description, position: "top-right" })
}

function fallback(name: string) {
    return name.includes(" ")
        ? name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : name.slice(0, 2).toUpperCase()
}

function Error({ error }: { error: string }) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
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
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>{message}</span>
            </div>
        </div>
    )
}
