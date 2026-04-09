import { eq, and, asc, lt, not, arrayContains, gt } from "drizzle-orm"
import { CreateError, toTypeBox, xcf } from "../../function"
import { ErrorResponse, Message, UUID } from "schema"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export default function GetMessages(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/conversations/:id/messages",
        schema: {
            description: "Get messages in a conversation",
            tags: ["Messages"],
            params: Type.Object({ id: UUID }),
            querystring: Type.Object({
                page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
                limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 50 })),
                before: Type.Optional(Type.String({ format: "date-time" })),
                after: Type.Optional(Type.String({ format: "date-time" }))
            }),
            response: {
                200: Type.Array(Message, { maxItems: 100, minItems: 0 }),
                400: ErrorResponse(400, "Bad request - invalid query parameters"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: userId } = request.payload
                const { id: conversationId } = request.params
                const { page = 1, limit = 50, before, after } = request.query

                const [conversation] = await db
                    .select()
                    .from(table.conversations)
                    .where(
                        and(
                            eq(table.conversations.id, conversationId),
                            arrayContains(table.conversations.users, [userId])
                        )
                    )

                if (!conversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                const whereConditions = [
                    eq(table.messages.conversation, conversation.id),
                    not(arrayContains(table.messages.status, ["deleted"]))
                ]

                if (before) {
                    const beforeDate = new Date(before)
                    if (isNaN(beforeDate.getTime())) {
                        throw CreateError(400, "INVALID_TIMESTAMP", "Invalid 'before' timestamp format")
                    }
                    whereConditions.push(lt(table.messages.createdAt, beforeDate))
                }
                if (after) {
                    const afterDate = new Date(after)
                    if (isNaN(afterDate.getTime())) {
                        throw CreateError(400, "INVALID_TIMESTAMP", "Invalid 'after' timestamp format")
                    }
                    whereConditions.push(gt(table.messages.createdAt, afterDate))
                }

                const offset = (page - 1) * limit

                const messages = await db
                    .select()
                    .from(table.messages)
                    .where(and(...whereConditions))
                    .orderBy(asc(table.messages.id))
                    .limit(limit)
                    .offset(offset)

                return reply.code(200).send(messages.map((x) => toTypeBox(x)))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
