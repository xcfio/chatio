import Swagger from "@fastify/swagger"
import { version } from "../../package.json"
import { main } from "../"

export default async function swagger(fastify: Awaited<ReturnType<typeof main>>) {
    await fastify.register(Swagger, {
        hideUntagged: true,
        openapi: {
            openapi: "3.1.1",
            info: {
                title: "Chatio",
                version: version
            }
        }
    })
}
