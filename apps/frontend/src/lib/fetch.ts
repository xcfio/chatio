"use client"

import {
    AuthenticatedUser,
    ChangeUserEmail,
    ChangeUserInfo,
    ChangeUserPassword,
    Conversation,
    ErrorResponse,
    LoginUser,
    Message,
    PublicUser,
    RegisterUser
} from "schema"
import { Value } from "typebox/value"
import { Static } from "typebox"
import ky from "ky"

const api = ky.create({
    prefix: process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:7200",
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
        },
        changeEmail: async (
            obj: Static<typeof ChangeUserEmail>
        ): Promise<Static<typeof AuthenticatedUser> | string> => {
            try {
                const data = await api.patch("auth/user/email", { json: obj }).json<Static<typeof AuthenticatedUser>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        changePassword: async (
            obj: Static<typeof ChangeUserPassword>
        ): Promise<Static<typeof AuthenticatedUser> | string> => {
            try {
                const data = await api
                    .patch("auth/user/password", { json: obj })
                    .json<Static<typeof AuthenticatedUser>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        updateUser: async (obj: Static<typeof ChangeUserInfo>): Promise<Static<typeof AuthenticatedUser> | string> => {
            try {
                const data = await api.patch("auth/user", { json: obj }).json<Static<typeof AuthenticatedUser>>()
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
        getOne: async (
            id: string,
            type: "conversation" | "user" = "conversation"
        ): Promise<Static<typeof Conversation> | string> => {
            try {
                const data = await api.get(`conversations/${id}?type=${type}`).json<Static<typeof Conversation>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        },
        getAll: async (page?: number, limit?: number): Promise<Array<Static<typeof Conversation>> | string> => {
            try {
                const searchParams: Record<string, string> = {}

                if (typeof page === "number" && Number.isFinite(page) && page >= 0) {
                    searchParams["page"] = String(page)
                }

                if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
                    searchParams["limit"] = String(limit)
                }

                const data = await api.get(`conversations`, { searchParams }).json<Array<Static<typeof Conversation>>>()

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
                const searchParams: Record<string, string> = {}

                if (typeof options?.page === "number" && Number.isFinite(options.page) && options.page >= 1) {
                    searchParams["page"] = String(options.page)
                }

                if (
                    typeof options?.limit === "number" &&
                    Number.isFinite(options.limit) &&
                    options.limit >= 1 &&
                    options.limit <= 100
                ) {
                    searchParams["limit"] = String(options.limit)
                }

                if (typeof options?.before === "string" && options.before.trim()) {
                    searchParams["before"] = options.before
                }

                if (typeof options?.after === "string" && options.after.trim()) {
                    searchParams["after"] = options.after
                }

                const data = await api
                    .get(`conversations/${conversationId}/messages`, { searchParams })
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
        getAll: async (
            options: {
                id?: Array<string>
                page?: number
                limit?: number
                search?: string
            } = {}
        ): Promise<Array<Static<typeof PublicUser>> | string> => {
            try {
                const searchParams: Record<string, string> = {}

                if (typeof options.page === "number" && Number.isFinite(options.page) && options.page >= 1) {
                    searchParams["page"] = String(options.page)
                }

                if (
                    typeof options.limit === "number" &&
                    Number.isFinite(options.limit) &&
                    options.limit >= 1 &&
                    options.limit <= 100
                ) {
                    searchParams["limit"] = String(options.limit)
                }

                if (typeof options.search === "string" && options.search.trim()) {
                    searchParams["search"] = options.search
                }

                const data = await api
                    .post(`users`, { searchParams, json: options.id ? options.id : null })
                    .json<Array<Static<typeof PublicUser>>>()
                return isError(data) ? data.message : data
            } catch (error) {
                console.log(error)
                return "An error occurred"
            }
        }
    }
} as const
