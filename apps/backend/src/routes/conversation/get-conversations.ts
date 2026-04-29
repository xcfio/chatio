import { CreateError, toTypeBox, xcf } from "../../function"
import { Conversation, ErrorResponse } from "@repo/schema"
import { desc, arrayContains } from "drizzle-orm"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export function GetConversation(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/conversations",
        schema: {
            description: "Get user's conversations list",
            tags: ["Conversations"],
            querystring: Type.Object({
                page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
                limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 }))
            }),
            response: {
                200: Type.Array(Conversation, { maxItems: 100, minItems: 0 }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { page = 1, limit = 20 } = request.query
                const user = request.payload

                if (!user) {
                    throw CreateError(401, "UNAUTHORIZED", "User authentication required")
                }

                const offset = (page - 1) * limit
                const conversations = await db
                    .select()
                    .from(table.conversations)
                    .where(arrayContains(table.conversations.users, [user.id]))
                    .orderBy(desc(table.conversations.updatedAt))
                    .limit(limit)
                    .offset(offset)

                return reply.status(200).send(
                    conversations.map((x) => {
                        const participant = x.users.filter((id) => id !== user.id).shift() ?? ""
                        return toTypeBox({ participant, ...x })
                    })
                )
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
