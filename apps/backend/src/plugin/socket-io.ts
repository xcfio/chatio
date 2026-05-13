import fastifyIO from "fastify-socket"
import { main } from "../"

export default async function socket(fastify: Awaited<ReturnType<typeof main>>) {
    await fastify.register(fastifyIO, {
        cookie: true,
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:7700",
            credentials: true
        }
    })
}
