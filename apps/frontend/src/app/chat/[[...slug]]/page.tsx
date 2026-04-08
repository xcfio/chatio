"use client"

import {
    ComponentType,
    createContext,
    Dispatch,
    InputEvent,
    SetStateAction,
    SVGProps,
    SyntheticEvent,
    Usable,
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
    PublicUser
} from "schema"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertCircleIcon,
    Eye,
    EyeOff,
    HelpCircle,
    Home,
    LoaderCircle,
    LogOut,
    MessageCircle,
    Monitor,
    MoonIcon,
    Palette,
    Search,
    Send,
    SettingsIcon,
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Github } from "@/components/icon/github"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

export const ChatContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([false, () => {}])
export const DialogContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([false, () => {}])

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
    const [error, setError] = useState<string | null>(null)
    const [width, setWidth] = useState(globalThis.innerWidth)
    const [loading, setLoading] = useState<boolean>(true)
    const [isChat, setIsChat] = useState(false)
    const { slug: [slug] = [] } = use(params) as { slug?: [string] }

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
    const [conversation] = useContext(CurrentConversationContext) ?? [null, () => {}]
    const [members] = useContext(MembersContext) ?? [[], () => {}]
    const [messages] = useContext(MessageContext) ?? [[], () => {}]
    const [user] = useContext(UserContext) ?? [null, () => {}]

    const opponent = members.find((m) => m.id === conversation?.participant)
    const displayName = opponent?.name ?? user?.name ?? "Unknown User"
    const fallbackInitials = displayName.includes(" ")
        ? displayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : displayName.slice(0, 2).toUpperCase()

    if (!messages.length) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start chatting.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-end gap-4 rounded-b-2xl bg-muted p-4">
                <Avatar className="scale-125">
                    {opponent?.avatar && <AvatarImage src={opponent.avatar} alt={displayName} />}
                    <AvatarFallback>{fallbackInitials}</AvatarFallback>
                    {/* <AvatarBadge className="bg-green-600 dark:bg-green-800" /> */}
                </Avatar>
                <p className="font-comfortaa tracking-tight">{displayName}</p>
            </div>
            <ScrollArea className="h-full w-full px-2 py-2">
                {messages.flat().map((message) => {
                    const isCurrentUser = message.sender === user?.id

                    return (
                        <div className="py-2 w-full flex flex-col" key={message.id}>
                            <HoverCard openDelay={10} closeDelay={100}>
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
                                <HoverCardContent className="flex w-64 flex-col gap-0.5 text-xs">
                                    {!isCurrentUser && (
                                        <p>
                                            Sent by:
                                            {members.find((u) => u.id === message.sender)?.name ?? "Unknown User"}
                                        </p>
                                    )}
                                    {message.updatedAt && message.updatedAt !== message.createdAt && (
                                        <p>Updated At: {new Date(message.updatedAt).toLocaleString()}</p>
                                    )}
                                    <p>Created At: {new Date(message.createdAt).toLocaleString()}</p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                    )
                })}
            </ScrollArea>
            <form className="mt-auto bg-muted p-4">
                <div className="mx-auto flex w-full items-center gap-2">
                    <Input placeholder="Type a message..." />
                    <Button type="submit" className="shrink-0">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </form>
        </div>
    )
}

function User() {
    const [currentConversation, setCurrentConversation] = useContext(CurrentConversationContext) ?? [null, () => {}]
    const [isChat, setIsChat] = useContext(ChatContext) ?? [[], () => {}]
    const [members, setMembers] = useContext(MembersContext) ?? [[], () => {}]
    const [error, setError] = useState<string | null>(null)

    async function handleConversationSelect(id: string) {
        const res = await ftc.conversations.getOne(id, "user")
        if (typeof res === "string") return setError(res)
        setCurrentConversation(res)
        window.history.replaceState(null, "", `/chat/${res.id}`)
        setIsChat(true)
    }

    if (error) return <Error error={error} />

    return (
        <div className="flex flex-col">
            <div className="bg-muted rounded-b-md p-4">
                <div className="flex flex-row justify-between  mb-1">
                    <h1 className="font-comfortaa text-2xl mb-2.5 tracking-tight text-foreground">Chatio</h1>
                    <Dropdown />
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
            <ScrollArea>
                {members.map((user, index) => {
                    return (
                        <div key={index}>
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
                <SidebarProvider className="items-start">
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
