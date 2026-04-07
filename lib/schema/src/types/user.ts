import { Date, Nullable, UUID } from "./utility"
import { UserSelect } from "../table"
import Type from "typebox"

export const RegisterUser = Type.Object({
    email: Type.String({ format: "email" }),
    name: UserSelect.properties.name,
    username: Type.String({ pattern: "^[a-zA-Z][a-zA-Z0-9-]{2,11}$" }),
    gender: UserSelect.properties.gender,
    avatar: Type.Optional(Type.String({ format: "uri" })),
    password: Type.String({ minLength: 6, maxLength: 30 })
})

export const LoginUser = Type.Object({
    input: Type.String(),
    password: Type.String()
})

export const ChangeUserEmail = Type.Object({
    email: Type.String(),
    password: Type.String()
})
export const ChangeUserPassword = Type.Object({
    oldPassword: Type.String(),
    newPassword: Type.String()
})

export const PublicUser = Type.Object({
    id: UUID,
    name: UserSelect.properties.name,
    username: Type.String({ pattern: "^[a-zA-Z][a-zA-Z0-9-]{2,11}$" }),
    avatar: Nullable(Type.String({ format: "uri" })),
    createdAt: Date
})

export const AuthenticatedUser = Type.Interface(
    [Type.Omit(UserSelect, ["ban", "password", "createdAt", "updatedAt"])],
    { createdAt: Date, updatedAt: Date }
)

export const ChangeUserInfo = Type.Partial(Type.Pick(AuthenticatedUser, ["name", "username", "gender", "avatar"]))
