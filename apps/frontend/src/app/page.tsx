"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Page } from "@/components/page"
import { Catch } from "@/lib/catch"
import { ftc } from "@/lib/fetch"

import { AlertCircleIcon, CheckCircle2Icon, Eye, EyeOff } from "lucide-react"
import { AuthenticatedUser, LoginUser, RegisterUser } from "schema"
import { InputEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Value } from "typebox/value"

export default () => {
    const router = useRouter()
    const errorRef = useRef<HTMLDivElement>(null)
    const successRef = useRef<HTMLDivElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const passwordElement = useRef<HTMLDivElement>(null)
    const conformPasswordElement = useRef<HTMLDivElement>(null)

    const [gender, setGender] = useState<string>("")
    const [show, setShow] = useState(false)
    const [isRegistration, setIsRegistration] = useState(false)
    const [error, setError] = useState<{ title: string; description: string } | null>(null)
    const [success, setSuccess] = useState<{ title: string; description: string } | null>(null)

    const getUser = async () => {
        const user = window.sessionStorage.getItem("user")
        if (user) {
            router.push("/chat")
            return
        }

        const me = await ftc.auth.me()
        if (Value.Check(AuthenticatedUser, me)) {
            window.sessionStorage.setItem("user", JSON.stringify(me))
            router.push("/chat")
            return
        }
    }
    useEffect(() => {
        getUser()
    }, [])

    async function registrationSubmit(form: FormData) {
        try {
            const data = Object.fromEntries(form.entries())

            if (!Value.Check(RegisterUser, data)) {
                const errors = [...Value.Errors(RegisterUser, data)]
                const message = errors.map((e: any) => `${e.path ?? "Form"}: ${e.message}`).join(", ")
                setError({ title: "Validation failed", description: message })
                return
            }

            const output = await ftc.auth.register(data)
            if (typeof output === "string") {
                setError({ title: "Registration failed", description: output })
                setSuccess(null)
            } else {
                window.sessionStorage.setItem("user", JSON.stringify(output))
                setSuccess({ title: "Registration successful", description: `Welcome, ${output.name}! Redirecting...` })
                setError(null)
                setTimeout(() => router.push("/chat"), 2000)
            }
        } catch (error) {
            Catch(error)
        }
    }

    async function loginSubmit(form: FormData) {
        try {
            const data = Object.fromEntries(form.entries())

            if (!Value.Check(LoginUser, data)) {
                const errors = [...Value.Errors(LoginUser, data)]
                const message = errors.map((e: any) => `${e.path ?? "Form"}: ${e.message}`).join(", ")
                setError({ title: "Validation failed", description: message })
                return
            }

            const output = await ftc.auth.login(data)
            if (typeof output === "string") {
                setError({ title: "Login failed", description: output })
                setSuccess(null)
            } else {
                window.sessionStorage.setItem("user", JSON.stringify(output))
                setSuccess({ title: "Login successful", description: `Welcome back, ${output.name}! Redirecting...` })
                setError(null)
                setTimeout(() => router.push("/chat"), 2000)
            }
        } catch (error) {
            Catch(error)
        }
    }

    function changeTabs() {
        try {
            setIsRegistration(!isRegistration)
            setSuccess(null)
            setError(null)
            setGender("")
        } catch (error) {
            Catch(error)
        }
    }

    function registrationUsernameCheck(event: InputEvent<HTMLInputElement>) {
        try {
            if (!/^[a-zA-Z][a-zA-Z0-9-]{2,11}$/.test(event.currentTarget.value)) {
                event.currentTarget.setCustomValidity(
                    "Username must be 4-12 characters, start with a letter, and contain only letters, numbers, and hyphens (-)"
                )
            } else {
                event.currentTarget.setCustomValidity("")
            }
        } catch (error) {
            Catch(error)
        }
    }

    function registrationPasswordCheck(event: InputEvent<HTMLInputElement>) {
        try {
            if (event.currentTarget.value !== passwordRef.current?.value) {
                event.currentTarget.setCustomValidity("Passwords do not match")
                passwordElement.current?.setAttribute("data-invalid", "true")
                conformPasswordElement.current?.setAttribute("data-invalid", "true")
            } else {
                event.currentTarget.setCustomValidity("")
                passwordElement.current?.setAttribute("data-invalid", "false")
                conformPasswordElement.current?.setAttribute("data-invalid", "false")
            }
        } catch (error) {
            Catch(error)
        }
    }

    return (
        <Page>
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-5">
                {error && (
                    <Alert ref={errorRef} className="max-w-md rounded-xl" variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>{error.title}</AlertTitle>
                        <AlertDescription>{error.description}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert ref={successRef} className="max-w-md rounded-xl">
                        <CheckCircle2Icon />
                        <AlertTitle>{success.title}</AlertTitle>
                        <AlertDescription>{success.description}</AlertDescription>
                    </Alert>
                )}
                {isRegistration ? (
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Create Account</CardTitle>
                            <CardDescription>Please fill in your details below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={registrationSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="name">
                                            Name <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Enter your name"
                                            title="Enter your name"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="username">
                                            Username <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="username"
                                            name="username"
                                            placeholder="Enter your username"
                                            required
                                            onInput={registrationUsernameCheck}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="email">
                                            Email <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            type="email"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="gender">
                                            Gender <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Select onValueChange={setGender} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="gender" value={gender} />
                                    </Field>
                                    <Field ref={passwordElement}>
                                        <FieldLabel htmlFor="password">
                                            Password <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="password"
                                                name="password"
                                                ref={passwordRef}
                                                type={show ? "text" : "password"}
                                                placeholder="Enter your password"
                                                minLength={6}
                                                maxLength={30}
                                                required
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setShow(!show)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                    aria-label="Show Your Password"
                                                >
                                                    {show ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>

                                    <Field ref={conformPasswordElement}>
                                        <FieldLabel htmlFor="confirmPassword">
                                            Confirm Password <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={show ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                minLength={6}
                                                maxLength={30}
                                                required
                                                onInput={registrationPasswordCheck}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setShow(!show)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                    aria-label="Show Your Password"
                                                >
                                                    {show ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                    <Field orientation="horizontal" className="flex flex-row justify-between">
                                        <Button type="submit">Submit</Button>
                                        <Button type="button" variant="ghost" onClick={changeTabs}>
                                            Already have an account? Login
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>Please enter your credentials to continue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={loginSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="input">
                                            Username or email address <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="input"
                                            name="input"
                                            placeholder="Enter your username or email"
                                            required
                                        />
                                    </Field>
                                    <Field ref={passwordElement}>
                                        <div className="flex justify-between items-center">
                                            <FieldLabel htmlFor="password">
                                                Password <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="text-muted-foreground text-xs p-0 h-auto not-sr-only"
                                                onClick={() => router.push("/forget")}
                                            >
                                                Forgot password?
                                            </Button>
                                            <a className="sr-only" href="/forget">
                                                Forgot password?
                                            </a>
                                        </div>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="password"
                                                name="password"
                                                ref={passwordRef}
                                                type={show ? "text" : "password"}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setShow(!show)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                    aria-label="Show Your Password"
                                                >
                                                    {show ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                    <Field orientation="horizontal" className="flex flex-row justify-between">
                                        <Button type="submit">Submit</Button>
                                        <Button type="button" variant="ghost" onClick={changeTabs}>
                                            Don't have an account? Register
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Page>
    )
}
