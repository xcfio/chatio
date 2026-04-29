import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import {
    conversations,
    messages,
    users,
    ConversationInsert,
    ConversationSelect,
    ConversationUpdate,
    MessageInsert,
    MessageSelect,
    MessageUpdate,
    UserInsert,
    UserSelect,
    UserUpdate
} from "@repo/schema"

export const db = drizzle({ client: postgres(process.env.DATABASE_URI) })

export const table = {
    conversations,
    messages,
    users
} as const

export const Schema = {
    ConversationInsert,
    ConversationSelect,
    ConversationUpdate,
    MessageInsert,
    MessageSelect,
    MessageUpdate,
    UserInsert,
    UserSelect,
    UserUpdate
} as const
