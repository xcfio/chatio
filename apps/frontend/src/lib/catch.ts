"use client"

import { getSocket } from "./socket"

export async function Catch(inputtedError: unknown) {
    console.log(inputtedError)

    const socket = getSocket()
    const error: Error = Error.isError(inputtedError)
        ? inputtedError
        : new Error(typeof inputtedError === "string" ? inputtedError : JSON.stringify(inputtedError))

    socket.emit("errors", {
        name: `Client Error (${new Date().getTime().toString(36)})`,
        message: error.message,
        stack: error.stack
    })
}
