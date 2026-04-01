import { CreateError, toTypeBox, xcf } from "../../function"
import { Conversation, ErrorResponse, UUID } from "schema"
import { and, arrayContains, eq } from "drizzle-orm"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export function GetConversationId(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/conversations/:id",
        schema: {
            description: "Get specific conversation details",
            tags: ["Conversations"],
            params: Type.Object({ id: UUID }),
            querystring: Type.Partial(Type.Object({ type: Type.String() })),
            response: {
                200: Conversation,
                400: ErrorResponse(400, "Bad request - Invalid conversation type"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                403: ErrorResponse(403, "Forbidden - not a participant in this conversation"),
                404: ErrorResponse(404, "Not found - Conversation not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { type } = request.query
                const { id } = request.params
                const user = request.payload

                const conditions = []

                switch (type) {
                    case "conversation": {
                        conditions.push(
                            eq(table.conversations.id, id),
                            arrayContains(table.conversations.users, [user.id])
                        )
                        break
                    }

                    case "user": {
                        conditions.push(arrayContains(table.conversations.users, [user.id, id]))
                        break
                    }

                    default: {
                        throw CreateError(400, "INVALID_CONVERSATION_TYPE", "Invalid conversation type")
                    }
                }

                const [conversation] = await db
                    .select()
                    .from(table.conversations)
                    .where(and(...conditions))

                if (!conversation) {
                    throw CreateError(404, "CONVERSATION_NOT_FOUND", "Conversation not found")
                }

                const participant = conversation.users.filter((id) => id !== user.id).shift() ?? ""
                return reply.status(200).send(toTypeBox({ participant, ...conversation }))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
