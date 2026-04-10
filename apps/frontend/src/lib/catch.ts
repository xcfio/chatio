"use client"

export async function Catch(inputtedError: unknown) {
    console.log(inputtedError)

    const error: Error = Error.isError(inputtedError)
        ? inputtedError
        : new Error(typeof inputtedError === "string" ? inputtedError : JSON.stringify(inputtedError))

    // TODO: make a REST API for logging errors instead of sending them through sockets
}
