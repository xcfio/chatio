"use client"

import { AuthenticatedUser, Conversation, ErrorResponse, LoginUser, Message, PublicUser, RegisterUser } from "schema"
import { Value } from "typebox/value"
import { Static } from "typebox"
import ky from "ky"

const api = ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:7200",
    credentials: "include",
    throwHttpErrors: false
})

const isError = (data: unknown) => Value.Check(ErrorResponse(500), data)

export const ftc = {
    auth: {
        login: async (obj: Static<typeof LoginUser>): Promise<Static<typeof AuthenticatedUser> | string> => {
            try {
                const data = await api.post("auth/login", { json: obj }).json<Static<typeof AuthenticatedUser>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        logout: async (): Promise<boolean | string> => {
            try {
                const data = await api.post("auth/logout").json<{ success: boolean }>()
                return isError(data) ? data.message : data.success
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        me: async (): Promise<Static<typeof AuthenticatedUser> | string> => {
            try {
                const data = await api.get("auth/me").json<Static<typeof AuthenticatedUser>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        register: async (obj: Static<typeof RegisterUser>): Promise<Static<typeof AuthenticatedUser> | string> => {
            try {
                const data = await api.post("auth/register", { json: obj }).json<Static<typeof AuthenticatedUser>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        }
    },
    conversations: {
        create: async (userId: string): Promise<Static<typeof Conversation> | string> => {
            try {
                const data = await api.post(`conversations/${userId}`).json<Static<typeof Conversation>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        delete: async (id: string): Promise<boolean | string> => {
            try {
                const data = await api.delete(`conversations/${id}`).json<{ success: boolean }>()
                return isError(data) ? data.message : data.success
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        getOne: async (id: string): Promise<Static<typeof Conversation> | string> => {
            try {
                const data = await api.get(`conversations/${id}`).json<Static<typeof Conversation>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        getAll: async (page?: number, limit?: number): Promise<Array<Static<typeof Conversation>> | string> => {
            try {
                const params = new URLSearchParams()

                if (typeof page === "number" && Number.isFinite(page) && page >= 0) {
                    params.set("page", String(page))
                }

                if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
                    params.set("limit", String(limit))
                }

                const queryString = params.toString() ? `?${params.toString()}` : ""
                const data = await api.get(`conversations${queryString}`).json<Array<Static<typeof Conversation>>>()

                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        }
    },
    messages: {
        getAll: async (
            conversationId: string,
            options?: { page?: number; limit?: number; before?: string; after?: string }
        ): Promise<Array<Static<typeof Message>> | string> => {
            try {
                const params = new URLSearchParams()

                if (typeof options?.page === "number" && Number.isFinite(options.page) && options.page >= 1) {
                    params.set("page", String(options.page))
                }

                if (
                    typeof options?.limit === "number" &&
                    Number.isFinite(options.limit) &&
                    options.limit >= 1 &&
                    options.limit <= 100
                ) {
                    params.set("limit", String(options.limit))
                }

                if (typeof options?.before === "string" && options.before.trim()) {
                    params.set("before", options.before)
                }

                if (typeof options?.after === "string" && options.after.trim()) {
                    params.set("after", options.after)
                }

                const queryString = params.toString() ? `?${params.toString()}` : ""
                const data = await api
                    .get(`conversations/${conversationId}/messages${queryString}`)
                    .json<Array<Static<typeof Message>>>()

                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        send: async (conversationId: string, content: string): Promise<Static<typeof Message> | string> => {
            try {
                const data = await api
                    .post(`conversations/${conversationId}/messages`, { json: { content } })
                    .json<Static<typeof Message>>()

                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        read: async (id: string): Promise<boolean | string> => {
            try {
                const data = await api.put(`messages/${id}/read`).json<{ success: boolean }>()
                return isError(data) ? data.message : data.success
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        edit: async (id: string, content: string): Promise<Static<typeof Message> | string> => {
            try {
                const data = await api.patch(`messages/${id}`, { json: { content } }).json<Static<typeof Message>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        delete: async (id: string): Promise<boolean | string> => {
            try {
                const data = await api.delete(`messages/${id}`).json<{ success: boolean }>()
                return isError(data) ? data.message : data.success
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        }
    },
    user: {
        getOne: async (id: string): Promise<Static<typeof PublicUser> | string> => {
            try {
                const data = await api.get(`users/${id}`).json<Static<typeof PublicUser>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        getAll: async (options?: {
            page?: number
            limit?: number
            search?: string
        }): Promise<Array<Static<typeof PublicUser>> | string> => {
            try {
                const params = new URLSearchParams()

                if (typeof options?.page === "number" && Number.isFinite(options.page) && options.page >= 1) {
                    params.set("page", String(options.page))
                }

                if (
                    typeof options?.limit === "number" &&
                    Number.isFinite(options.limit) &&
                    options.limit >= 1 &&
                    options.limit <= 100
                ) {
                    params.set("limit", String(options.limit))
                }

                if (typeof options?.search === "string" && options.search.trim()) {
                    params.set("search", options.search)
                }

                const queryString = params.toString() ? `?${params.toString()}` : ""
                const data = await api.get(`users${queryString}`).json<Array<Static<typeof PublicUser>>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        }
    }
} as const
