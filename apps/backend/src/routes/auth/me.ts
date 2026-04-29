import { AuthenticatedUser, ErrorResponse } from "@repo/schema"
import { CreateError, toTypeBox, xcf } from "../../function"
import { db, table } from "../../database"
import { and, eq, isNull } from "drizzle-orm"
import { main } from "../../"

export default function Login(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/auth/me",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            response: {
                200: AuthenticatedUser,
                403: ErrorResponse(403, "Forbidden - User is banned"),
                404: ErrorResponse(404, "Not Found - User Not found"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.payload
                const [user] = await db.select().from(table.users).where(eq(table.users.id, id))

                if (user.ban) {
                    throw CreateError(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${user.ban} Contact support for more information.`
                    )
                }

                if (!user) throw CreateError(404, "USER_NOT_FOUND", "User not found")
                return reply.status(200).send(toTypeBox(user))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
