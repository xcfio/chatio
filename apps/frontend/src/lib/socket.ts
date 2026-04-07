"use client"

import { ClientToServerEvents, ServerToClientEvents } from "schema"
import { io, Socket } from "socket.io-client"

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export function getSocket() {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:7200", {
            withCredentials: true,
            transports: ["websocket"]
        }).connect()
    }
    return socket
}
