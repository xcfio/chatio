import { CreateError, isFastifyError } from "../function"
import { FastifyRequest, FastifyReply } from "fastify"
import { Payload } from "@repo/schema"
import { main } from "../"
import Value from "typebox/value"
import { AssertionError } from "assert"

export default async function auth(fastify: Awaited<ReturnType<typeof main>>) {
    fastify.decorate("auth", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = await request.jwtVerify()

            if (!Value.Check(Payload, user)) {
                reply.clearCookie("auth", { path: "/", signed: true, sameSite: "strict" })
                throw CreateError(401, "INVALID_TOKEN_PAYLOAD", "Invalid authentication token structure")
            }

            request.payload = user
        } catch (error) {
            if (isFastifyError(error) || AssertionError.isError(error)) {
                reply.clearCookie("auth", { path: "/", signed: true, sameSite: "strict" })
                throw CreateError(401, "AUTHENTICATION_FAILED", "Authentication failed")
            } else {
                console.trace(error)
                reply.clearCookie("auth", { path: "/", signed: true, sameSite: "strict" })
                throw CreateError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error")
            }
        }
    })
}
