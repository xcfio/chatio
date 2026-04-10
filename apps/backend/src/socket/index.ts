import { AuthenticatedSocket, Payload } from "schema"
import { and, eq, isNull } from "drizzle-orm"
import UserStatusChanged from "./user-status"
import TypingStatusChanged from "./typing"
import { db, table } from "../database"
import { main } from "../"

export default (fastify: Awaited<ReturnType<typeof main>>) => async (socket: Required<AuthenticatedSocket>) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie ?? ""
        const { auth } = fastify.parseCookie(cookieHeader)

        if (!auth) {
            socket.emit("errors", "AUTH_TOKEN_MISSING")
            socket.disconnect(true)
            return
        }

        const tokenParts = auth.split(".")
        const cleanToken = tokenParts.length >= 3 ? tokenParts.slice(0, 3).join(".") : auth
        const { id } = fastify.jwt.verify(cleanToken) as Payload

        const [user] = await db
            .select()
            .from(table.users)
            .where(and(isNull(table.users.ban), eq(table.users.id, id)))

        if (!user) {
            socket.emit("errors", "USER_NOT_FOUND")
            socket.disconnect(true)
        }

        socket.user = user
        socket.join(socket.user.id)

        UserStatusChanged(socket)
        TypingStatusChanged(socket)
    } catch (error) {
        console.error(`Socket ${socket.id} authentication failed:`, error)
        socket.emit("errors", "Invalid authentication token")
        socket.disconnect(true)
        return
    }
}
