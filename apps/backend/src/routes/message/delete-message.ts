import { CreateError, xcf } from "../../function"
import { ErrorResponse, UUID } from "@repo/schema"
import { db, table } from "../../database"
import { eq, and } from "drizzle-orm"
import { Type } from "typebox"
import { main } from "../../"

export default function DeleteMessage(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "DELETE",
        url: "/messages/:id",
        schema: {
            description: "Delete a message",
            tags: ["Messages"],
            params: Type.Object({ id: UUID }),
            response: {
                200: Type.Object({ success: Type.Boolean() }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - Message not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: msgId } = request.params
                const { id: userId } = request.payload

                const [{ messages, conversations }] = await db
                    .select()
                    .from(table.messages)
                    .leftJoin(table.conversations, eq(table.conversations.id, table.messages.conversation))
                    .where(and(eq(table.messages.id, msgId), eq(table.messages.sender, userId)))

                if (!messages || !conversations || messages.sender !== userId || messages.status.includes("deleted")) {
                    throw CreateError(404, "MESSAGE_NOT_FOUND", "Message not found")
                }

                await db
                    .update(table.messages)
                    .set({ status: [...messages.status, "deleted"] })
                    .where(and(eq(table.messages.id, msgId), eq(table.messages.sender, userId)))

                if (fastify.io) {
                    const toSend = conversations.users.filter((x) => x !== userId)
                    fastify.io.to(toSend).emit("message_deleted", msgId, conversations.id)
                }

                return reply.code(200).send({ success: true })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
