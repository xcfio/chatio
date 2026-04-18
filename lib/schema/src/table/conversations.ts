import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/typebox"
import { uuid, pgTable, timestamp } from "drizzle-orm/pg-core"
import { users } from "./users"
import { v7 } from "uuid"

export const conversations = pgTable("conversations", {
    id: uuid("id")
        .unique()
        .primaryKey()
        .$defaultFn(() => v7()),
    users: uuid("users").array().notNull(),
    createdAt: timestamp("created_at", { withTimezone: false })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { withTimezone: false })
        .notNull()
        .$onUpdateFn(() => new Date())
})

export const ConversationInsert = createInsertSchema(conversations)
export const ConversationSelect = createSelectSchema(conversations)
export const ConversationUpdate = createUpdateSchema(conversations)
