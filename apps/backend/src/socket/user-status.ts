import { AuthenticatedSocket } from "schema"
import { arrayContains } from "drizzle-orm"
import { db, table } from "../database"

export default async function UserStatusChanged(socket: Required<AuthenticatedSocket>) {
    try {
        const { user } = socket

        const conversations = await db
            .select()
            .from(table.conversations)
            .where(arrayContains(table.conversations.users, [user.id]))

        const relatedUserIds = Array.from(
            new Set(conversations.map((x) => x.users.filter((c) => c !== user.id).shift() ?? ""))
        )

        for (const userId of relatedUserIds) {
            socket.to(userId).emit("user_status_changed", user.id, "online")

            if ((await socket.in(userId).fetchSockets()).length > 0) {
                socket.emit("user_status_changed", userId, "online")
            }
        }

        socket.on("disconnect", () => {
            for (const userId of relatedUserIds) {
                socket.to(userId).emit("user_status_changed", user.id, "offline")
            }
        })
    } catch (error) {
        console.error(error)
        socket.emit("errors", "Internal Server Error")
    }
}
