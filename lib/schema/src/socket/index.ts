import { Message, UUID } from "../types"
import { UserSelect } from "../table"
import { Socket } from "socket.io"
import { Static } from "typebox"

export interface ClientToServerEvents {
    typing: (conversationId: Static<typeof UUID>, status: "started" | "stopped") => any
}

export interface ServerToClientEvents {
    user_status_changed: (userId: Static<typeof UUID>, status: "online" | "offline") => any
    message_created: (message: Static<typeof Message>, conversationId: Static<typeof UUID>) => any
    message_edited: (message: Static<typeof Message>, conversationId: Static<typeof UUID>) => any
    message_deleted: (messageId: Static<typeof UUID>, conversationId: Static<typeof UUID>) => any
    typing: (userId: Static<typeof UUID>, conversationId: Static<typeof UUID>, status: "started" | "stopped") => any
    errors: (message: string) => any
}

export interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
    user: Static<typeof UserSelect>
}
