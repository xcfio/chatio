import RateLimit from "@fastify/rate-limit"
import { main } from "../"

export default async function rl(fastify: Awaited<ReturnType<typeof main>>) {
    await fastify.register(RateLimit, {
        max: 10,
        timeWindow: 20000,
        allowList: ["127.0.0.1"],
        keyGenerator: (req) => {
            const forwarded = req.headers["x-forwarded-for"]
            return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip
        }
    })
}
