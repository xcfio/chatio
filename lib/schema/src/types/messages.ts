import { MessageSelect } from "../table"
import { Date, UUID } from "./utility"
import Type from "typebox"

export const MessageContent = Type.String({ minLength: 1, maxLength: 2000 })

export const Message = Type.Object({
    id: UUID,
    content: MessageContent,
    sender: UUID,
    conversation: UUID,
    status: MessageSelect.properties.status,
    createdAt: Date,
    updatedAt: Date
})
