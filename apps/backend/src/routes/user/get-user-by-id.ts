import { CreateError, toTypeBox, xcf } from "../../function"
import { ErrorResponse, PublicUser, UUID } from "@repo/schema"
import { db, table } from "../../database"
import { Type } from "typebox"
import { eq } from "drizzle-orm"
import { main } from "../../"

export default function GetUserByID(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "GET",
        url: "/users/:id",
        schema: {
            description: "Get specific user profile",
            tags: ["Users"],
            params: Type.Object({ id: UUID }),
            response: {
                200: PublicUser,
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                404: ErrorResponse(404, "Not found - User not found error"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { id } = request.params
                const [user] = await db.select().from(table.users).where(eq(table.users.id, id))

                if (!user) throw CreateError(404, "USER_NOT_FOUND", "User not found")
                return reply.status(200).send(toTypeBox(user))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
