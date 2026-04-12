import { ErrorResponse, Nullable, PublicUser, UUID } from "schema"
import { and, or, ilike, desc, eq } from "drizzle-orm"
import { toTypeBox, xcf } from "../../function"
import { db, table } from "../../database"
import { Type } from "typebox"
import { main } from "../../"

export default function GetUsers(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "POST",
        url: "/users",
        schema: {
            description: "Get list of all users",
            tags: ["Users"],
            querystring: Type.Partial(
                Type.Object({
                    page: Type.Integer({ default: 1, minimum: 1 }),
                    limit: Type.Integer({ maximum: 100, minimum: 1 }),
                    search: Type.String()
                })
            ),
            body: Nullable(Type.Array(UUID, { maxItems: 100, minItems: 0 })),
            response: {
                200: Type.Array(PublicUser, { maxItems: 100, minItems: 0 }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        config: {
            rateLimit: {
                max: 100,
                timeWindow: "1 minute"
            }
        },
        preHandler: fastify.auth,
        handler: async (request, reply) => {
            try {
                const { page = 1, limit = 20, search } = request.query
                const id = request.body
                const conditions = []

                if (id && id.length) {
                    conditions.push(or(...id.map((x) => eq(table.users.id, x))))
                }

                if (search) {
                    const il1 = ilike(table.users.username, `%${search}%`)
                    const il2 = ilike(table.users.name, `%${search}%`)
                    conditions.push(or(il1, il2))
                }

                const whereClause = conditions.length > 0 ? and(...conditions) : undefined
                const offset = (page - 1) * limit

                const user = await db
                    .select()
                    .from(table.users)
                    .where(whereClause)
                    .orderBy(desc(table.users.createdAt))
                    .limit(limit)
                    .offset(offset)

                return reply.status(200).send(user.map((x) => toTypeBox(x)))
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
