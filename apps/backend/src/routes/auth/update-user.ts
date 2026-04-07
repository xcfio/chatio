import { CreateError, toTypeBox, xcf } from "../../function"
import { AuthenticatedUser, ChangeUserInfo, ErrorResponse } from "schema"
import { db, table } from "../../database"
import { eq } from "drizzle-orm"
import { main } from "../../"

export default function UpdateUser(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "PATCH",
        url: "/auth/user",
        schema: {
            description: "Authenticate user and initiate a session",
            tags: ["Authentication"],
            body: ChangeUserInfo,
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
                const data = request.body

                if (!data.avatar) data.avatar = null
                const [oldUser] = await db.select().from(table.users).where(eq(table.users.id, id))

                if (!oldUser) {
                    throw CreateError(404, "USER_NOT_FOUND", "User not found")
                }

                if (oldUser.ban) {
                    throw CreateError(
                        403,
                        "USER_BANNED",
                        `User is banned. Reason: ${oldUser.ban} Contact support for more information.`
                    )
                }

                const [newUser] = await db.update(table.users).set(data).where(eq(table.users.id, id)).returning()

                return reply.status(200).send(toTypeBox(newUser))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
