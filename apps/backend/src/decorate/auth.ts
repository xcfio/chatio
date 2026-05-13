import { CreateError, isFastifyError } from "../function"
import { FastifyRequest, FastifyReply } from "fastify"
import { Payload } from "@repo/schema"
import Value from "typebox/value"
import { main } from "../"

export default async function auth(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.decorate("auth", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            const jwt = request.cookies.auth
            if (!jwt) {
                reply.log.info("No authentication token provided in cookies")
            } else {
                reply.log.info(`Authentication token found: ${jwt}`)
            }

            const user = await request.jwtVerify()

            if (!Value.Check(Payload, user)) {
                reply.clearCookie("auth", { signed: true, httpOnly: true, secure: true, sameSite: "none", path: "/" })
                reply.log.info(`Invalid token payload: ${JSON.stringify(user)}`)
                throw CreateError(401, "INVALID_TOKEN_PAYLOAD", "Invalid authentication token structure")
            }

            request.payload = user
        } catch (error) {
            reply.clearCookie("auth", { signed: true, httpOnly: true, secure: true, sameSite: "none", path: "/" })
            if (isFastifyError(error) || Error.isError(error)) {
                reply.log.info(`Authentication failed: ${JSON.stringify("message" in error ? error.message : error)}`)
                throw CreateError(401, "AUTHENTICATION_FAILED", "Authentication failed")
            } else {
                console.trace(error)
                reply.log.info(`Internal server error: ${JSON.stringify(error)}`)
                throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
            }
        }
    })
}
