import { ErrorResponse, Message, MessageContent, UUID } from "@repo/schema"
import { CreateError, toTypeBox, xcf } from "../../function"
import { eq, and, arrayContains } from "drizzle-orm"
import { db, table } from "../../database"
import { main } from "../../"
import { Type } from "typebox"

export default function SendMessage(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id/messages",
        schema: {
            description: "Send a new message to a conversation",
            tags: ["Messages"],
            params: Type.Object({ id: UUID }),
            body: Type.Object({ content: MessageContent }),
            response: {
                201: Message,
                400: ErrorResponse(400, "Bad request - invalid message content"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - conversation not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: conversationId } = request.params
                const { id: userId } = request.payload
                const { content } = request.body

                const trimmedContent = content.trim()
                if (!trimmedContent) {
                    throw CreateError(400, "INVALID_CONTENT", "Message content cannot be empty")
                }

                const [conversations] = await db
                    .select()
                    .from(table.conversations)
                    .where(
                        and(
                            eq(table.conversations.id, conversationId),
                            arrayContains(table.conversations.users, [userId])
                        )
                    )

                if (!conversations) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                const [message] = await db
                    .insert(table.messages)
                    .values({ content: trimmedContent, sender: userId, conversation: conversations.id })
                    .returning()

                await db
                    .update(table.conversations)
                    .set({ updatedAt: new Date() })
                    .where(eq(table.conversations.id, conversationId))

                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_created", toTypeBox(message), conversations.id)
                }

                return reply.code(201).send(toTypeBox(message))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
