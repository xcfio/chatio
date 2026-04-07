import ChangePassword from "./change-password"
import ChangeEmail from "./change-email"
import UpdateUser from "./update-user"
import Register from "./register"
import Logout from "./logout"
import Login from "./login"
import Me from "./me"
import { main } from "../../"

export default function Auth(fastify: Awaited<ReturnType<typeof main>>) {
    ChangePassword(fastify)
    ChangeEmail(fastify)
    UpdateUser(fastify)
    Register(fastify)
    Logout(fastify)
    Login(fastify)
    Me(fastify)
}
