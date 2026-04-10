import { and, arrayContains, eq } from "drizzle-orm"
import { CreateError, toTypeBox, xcf } from "../../function"
import { ErrorResponse, UUID } from "schema"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export default function ReadMessage(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "PUT",
        url: "/messages/:id/read",
        schema: {
            description: "Mark a message as read",
            tags: ["Messages"],
            params: Type.Object({ id: UUID }),
            response: {
                200: Type.Object({ success: Type.Boolean() }),
                400: ErrorResponse(400, "Bad request - message cannot be marked as read"),
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
                const { id: userId } = request.payload

                const [{ messages, conversations }] = await db
                    .select()
                    .from(table.messages)
                    .leftJoin(table.conversations, eq(table.conversations.id, table.messages.conversation))
                    .where(and(eq(table.messages.id, id), arrayContains(table.conversations.users, [userId])))

                if (!messages || !conversations || messages.status.includes("deleted")) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                if (messages.status.includes("read")) {
                    throw CreateError(400, "MESSAGE_ALREADY_READ", "Message is already marked as read")
                }

                if (messages.sender === userId) {
                    throw CreateError(400, "CANNOT_MARK_OWN_MESSAGE", "Cannot mark your own message as read")
                }

                const [updatedMessage] = await db
                    .update(table.messages)
                    .set({ status: [...messages.status, "read"], updatedAt: messages.updatedAt })
                    .where(eq(table.messages.id, id))
                    .returning()

                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_edited", toTypeBox(updatedMessage), updatedMessage.conversation)
                }

                return reply.code(200).send({ success: true })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
