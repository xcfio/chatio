import { and, arrayContains, eq } from "drizzle-orm"
import { CreateError, xcf } from "../../function"
import { ErrorResponse, UUID } from "@repo/schema"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export function DeleteConversation(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "DELETE",
        url: "/conversations/:id",
        schema: {
            description: "Delete a conversation",
            tags: ["Conversations"],
            params: Type.Object({ id: UUID }),
            response: {
                200: Type.Object({ success: Type.Boolean() }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                403: ErrorResponse(403, "Forbidden - not authorized to delete this conversation"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const user = request.payload

                const [existingConversation] = await db
                    .select()
                    .from(table.conversations)
                    .where(and(eq(table.conversations.id, id), arrayContains(table.conversations.users, [user.id])))

                if (!existingConversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                const [deletedRows] = await db
                    .delete(table.conversations)
                    .where(eq(table.conversations.id, id))
                    .returning()

                if (!deletedRows) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                return reply.status(200).send({ success: true })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
