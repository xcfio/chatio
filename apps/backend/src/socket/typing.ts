import { and, arrayContains, eq } from "drizzle-orm"
import { AuthenticatedSocket } from "schema"
import { db, table } from "../database"

export default async function TypingStatusChanged(socket: Required<AuthenticatedSocket>) {
    socket.on("typing", async (conversationId: string, status: "started" | "stopped") => {
        try {
            const { user } = socket

            const [conversation] = await db
                .select()
                .from(table.conversations)
                .where(
                    and(eq(table.conversations.id, conversationId), arrayContains(table.conversations.users, [user.id]))
                )

            if (!conversation) return socket.emit("errors", "Conversation not found")
            const toSend = conversation.users.filter((x) => x !== user.id)
            socket.to(toSend).emit("typing", user.id, conversation.id, status)
        } catch (error) {
            console.error(error)
            socket.emit("errors", "Internal Server Error")
        }
    })
}
