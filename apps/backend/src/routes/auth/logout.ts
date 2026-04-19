import { CreateError, isFastifyError, xcf } from "../../function"
import { ErrorResponse } from "schema"
import { Type } from "typebox"
import { main } from "../../"

export default function Logout(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.route({
        method: "POST",
        url: "/auth/logout",
        schema: {
            description: "Logout user and clear authentication",
            tags: ["Authentication"],
            response: {
                200: Type.Object({ success: Type.Boolean() }),
                401: ErrorResponse(401, "Unauthorized - authentication required"),
                429: ErrorResponse(429, "Too many requests - rate limit exceeded"),
                500: ErrorResponse(500, "Internal server error")
            }
        },
        preHandler: fastify.auth,
        handler: async (_, reply) => {
            try {
                reply.clearCookie("auth", {
                    signed: true,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/"
                })

                return reply.send({
                    success: true,
                    message: "Successfully logged out"
                })
            } catch (error) {
                await xcf(error)
            }
        }
    })
}
