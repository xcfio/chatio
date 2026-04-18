import socket from "./socket-io"
import swagger from "./swagger"
import cookie from "./cookie"
import rl from "./rate-limit"
import scalar from "./scalar"
import cors from "./cors"
import jwt from "./jwt"
import { main } from "../"

export default async function Plugin(fastify: Awaited<ReturnType<typeof main>>) {
    if (process.env.NODE_ENV === "development") {
        await swagger(fastify)
        await scalar(fastify)
    }

    await rl(fastify)
    await socket(fastify)
    await cookie(fastify)
    await jwt(fastify)
    await cors(fastify)
}
