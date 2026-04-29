import { Message, UUID, ErrorResponse, MessageContent } from "@repo/schema"
import { CreateError, toTypeBox, xcf } from "../../function"
import { db, table } from "../../database"
import { eq, and } from "drizzle-orm"
import { Type } from "typebox"
import { main } from "../../"

export default function EditMessage(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "PATCH",
        url: "/messages/:id",
        schema: {
            description: "Edit a message",
            tags: ["Messages"],
            params: Type.Object({ id: UUID }),
            body: Type.Object({ content: MessageContent }),
            response: {
                200: Message,
                400: ErrorResponse(400, "Bad request - invalid content"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - Message not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const { content } = request.body
                const user = request.payload

                const [{ messages, conversations }] = await db
                    .select()
                    .from(table.messages)
                    .leftJoin(table.conversations, eq(table.conversations.id, table.messages.conversation))
                    .where(eq(table.messages.id, id))

                if (!messages || !conversations || messages.sender !== user.id || messages.status.includes("deleted")) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                if (messages.content === content.trim()) {
                    throw CreateError(400, "NO_CONTENT_CHANGE", "New content is the same as the current content")
                }

                const [updatedMessage] = await db
                    .update(table.messages)
                    .set({ content: content.trim() })
                    .where(and(eq(table.messages.id, id), eq(table.messages.sender, user.id)))
                    .returning()

                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== user.id)
                    fastify.io.to(toSend).emit("message_edited", toTypeBox(updatedMessage), conversations.id)
                }

                return reply.code(200).send(toTypeBox(updatedMessage))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
