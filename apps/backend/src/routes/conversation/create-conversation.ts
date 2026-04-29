import { CreateError, toTypeBox, xcf } from "../../function"
import { Conversation, ErrorResponse, UUID } from "@repo/schema"
import { arrayContains, eq } from "drizzle-orm"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export function CreateConversation(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "POST",
        url: "/conversations/:id",
        schema: {
            description: "Create new conversation with another user",
            tags: ["Conversations"],
            params: Type.Object({ id: UUID }),
            response: {
                201: Conversation,
                400: ErrorResponse(400, "Bad request - invalid user id or conversation already exists"),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id: otherUserId } = request.params
                const user = request.payload

                if (user.id === otherUserId) {
                    throw CreateError(400, "INVALID_REQUEST", "Cannot create conversation with yourself")
                }

                const [otherUser] = await db
                    .select({ id: table.users.id })
                    .from(table.users)
                    .where(eq(table.users.id, otherUserId))

                if (!otherUser) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }

                const existingConversation = await db
                    .select()
                    .from(table.conversations)
                    .where(arrayContains(table.conversations.users, [user.id, otherUser.id]))

                if (existingConversation.length > 0) {
                    throw CreateError(400, "CONVERSATION_EXISTS", "Conversation already exists between these users")
                }

                const [conversation] = await db
                    .insert(table.conversations)
                    .values({ users: [user.id, otherUser.id] })
                    .returning()

                if (!conversation) {
                    throw CreateError(500, "CREATION_FAILED", "Failed to create conversation")
                }

                const participant = conversation.users.filter((id) => id !== user.id).shift() ?? ""
                return reply.status(201).send(toTypeBox({ participant, ...conversation }))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
