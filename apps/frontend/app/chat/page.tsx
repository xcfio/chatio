"use client"

import {
    Component,
    ComponentType,
    createContext,
    Dispatch,
    SetStateAction,
    SVGProps,
    useContext,
    useEffect,
    useState
} from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthenticatedUser, Conversation, Message, PublicUser } from "schema"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertCircleIcon,
    HelpCircle,
    Home,
    Keyboard,
    LoaderCircle,
    LogOut,
    Menu,
    MessageCircle,
    MonitorIcon,
    MoonIcon,
    Paintbrush,
    PaletteIcon,
    Search,
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
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

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

export default () => {
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
        <DialogContext.Provider value={[isDialogOpen, setDialogOpen]}>
            <UserContext.Provider value={[user, setUser]}>
                <MembersContext.Provider value={[members, setMembers]}>
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
                </MembersContext.Provider>
            </UserContext.Provider>{" "}
        </DialogContext.Provider>
    )
}

function Chat() {
    const [members] = useContext(MembersContext) ?? [[], () => {}]
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
                        <HoverCardContent className="flex w-64 flex-col gap-0.5 text-xs">
                            {!isCurrentUser && (
                                <p>Sent by: {members.find((u) => u.id === message.sender)?.name ?? "Unknown User"}</p>
                            )}
                            {message.updatedAt && message.updatedAt !== message.createdAt && (
                                <p>Updated At: {new Date(message.updatedAt).toLocaleString()}</p>
                            )}
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
    const [members, setMembers] = useContext(MembersContext) ?? [[], () => {}]
    const [error, setError] = useState<string | null>(null)

    async function handleConversationSelect(id: string) {
        const res = await ftc.conversations.getOne(id, "user")
        if (typeof res === "string") return setError(res)

        setCurrentConversation(res)
    }

    if (error) return <Error error={error} />

    return (
        <div className="flex flex-col">
            <div className="bg-muted rounded-tl-md rounded-tr-md p-4">
                <div className="flex flex-row justify-between  mb-1">
                    <h1 className="font-comfortaa text-2xl mb-2.5 tracking-tight text-foreground">Chatio</h1>
                    <Dropdown />
                    <Settings />
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
    )
}

function Settings() {
    const [open, setOpen] = useContext(DialogContext) ?? [false, () => {}]
    const [user, setUser] = useContext(UserContext) ?? [null, () => {}]
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "shortcuts" | "account">("profile")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [gender, setGender] = useState<"male" | "female" | "other">("other")
    const [avatar, setAvatar] = useState("")
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        setName(user.name)
        setEmail(user.email)
        setUsername(user.username)
        setGender(user.gender)
        setAvatar(user.avatar ?? "")
    }, [user, open])

    const sections: Array<{ id: "profile" | "account"; title: string; icon: ComponentType<SVGProps<SVGSVGElement>> }> =
        [
            { id: "profile", title: "Profile", icon: UserCircle },
            { id: "account", title: "Account", icon: Home }
        ]

    function handleLocalProfileSave() {
        setError(null)
        setMessage(null)

        if (!user) {
            setError("Unable to update profile: user is not loaded.")
            return
        }

        const trimmedName = name.trim()
        const trimmedEmail = email.trim()
        const trimmedUsername = username.trim()
        const trimmedAvatar = avatar.trim()

        if (!trimmedName) {
            setError("Name cannot be empty.")
            return
        }

        if (!/^[a-zA-Z][a-zA-Z0-9-]{2,11}$/.test(trimmedUsername)) {
            setError("Username must match 3-12 chars and start with a letter.")
            return
        }

        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
            setError("Please provide a valid email address.")
            return
        }

        if (!["male", "female", "other"].includes(gender)) {
            setError("Please select a valid gender.")
            return
        }

        if (trimmedAvatar) {
            try {
                const parsed = new URL(trimmedAvatar)
                if (!/^https?:$/.test(parsed.protocol)) {
                    setError("Avatar URL must start with http:// or https://")
                    return
                }
            } catch {
                setError("Avatar URL is invalid.")
                return
            }
        }

        const nextUser = {
            ...user,
            name: trimmedName,
            email: trimmedEmail,
            username: trimmedUsername,
            gender,
            avatar: trimmedAvatar || null,
            updatedAt: new Date().toISOString()
        }

        setUser(nextUser)
        globalThis.sessionStorage.setItem("user", JSON.stringify(nextUser))
        setMessage("Profile updated locally. Server profile update endpoint is not available yet.")
    }

    async function handleLogout() {
        const res = await ftc.auth.logout()
        if (typeof res === "string") {
            setError(res)
            return
        }

        globalThis.sessionStorage.removeItem("user")
        router.push("/")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 md:max-h-125 md:max-w-175 lg:max-w-200">
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
                    <main className="flex h-120 flex-1 flex-col overflow-hidden">
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
                                                {sections.find((section) => section.id === activeTab)?.title ??
                                                    "Profile"}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                            {!!error && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>Settings error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {!!message && (
                                <Alert>
                                    <AlertTitle>Saved</AlertTitle>
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}

                            {activeTab === "profile" && (
                                <>
                                    <h2 className="mb-4 text-lg font-semibold">Edit profile</h2>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <p className="text-sm text-muted-foreground">Avatar preview</p>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    {!!avatar.trim() && (
                                                        <AvatarImage src={avatar.trim()} alt={username || name} />
                                                    )}
                                                    <AvatarFallback>
                                                        {(name || "U")
                                                            .split(" ")
                                                            .map((x) => x[0] ?? "")
                                                            .join("")
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="text-xs text-muted-foreground">
                                                    Set an image URL below to update your avatar.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-sm text-muted-foreground">Display name</p>
                                            <Input value={name} onChange={(event) => setName(event.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <Input
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-sm text-muted-foreground">Username</p>
                                            <Input
                                                value={username}
                                                onChange={(event) => setUsername(event.target.value)}
                                                placeholder="username"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-sm text-muted-foreground">Gender</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={gender === "male" ? "default" : "outline"}
                                                    onClick={() => setGender("male")}
                                                >
                                                    Male
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={gender === "female" ? "default" : "outline"}
                                                    onClick={() => setGender("female")}
                                                >
                                                    Female
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={gender === "other" ? "default" : "outline"}
                                                    onClick={() => setGender("other")}
                                                >
                                                    Other
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-sm text-muted-foreground">Avatar URL</p>
                                            <Input
                                                value={avatar}
                                                onChange={(event) => setAvatar(event.target.value)}
                                                placeholder="https://example.com/avatar.png"
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <Button onClick={handleLocalProfileSave}>Save profile</Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === "account" && (
                                <>
                                    <h2 className="mb-4 text-lg font-semibold">Account</h2>
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" onClick={() => router.push("/support")}>
                                            Contact support
                                        </Button>
                                        <Button variant="destructive" onClick={handleLogout}>
                                            Log out
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
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
