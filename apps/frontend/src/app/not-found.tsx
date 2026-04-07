"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Wifi } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [glitchActive, setGlitchActive] = useState(false)
    const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>(
        []
    )

    useEffect(() => {
        setMounted(true)

        const generatedParticles = [...Array(50)].map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 3}s`,
            duration: `${2 + Math.random() * 3}s`
        }))
        setParticles(generatedParticles)

        const glitchInterval = setInterval(() => {
            setGlitchActive(true)
            setTimeout(() => setGlitchActive(false), 200)
        }, 3000)

        return () => clearInterval(glitchInterval)
    }, [])

    return (
        <>
            <div className="min-h-screen bg-linear-to-br from-blue-900 via-teal-900 to-blue-900 flex items-center justify-center p-4 overflow-hidden relative">
                {/* Background particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {particles.map((particle, i) => (
                        <div
                            key={i}
                            className="particle absolute w-1 h-1 bg-teal-300 rounded-full opacity-30"
                            style={{
                                left: particle.left,
                                top: particle.top,
                                animationDelay: particle.delay,
                                animationDuration: particle.duration
                            }}
                        />
                    ))}
                </div>

                {/* Floating geometric shapes */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="shape-square absolute w-20 h-20 border-2 border-teal-500/30 rotate-45 top-20 left-20 md:w-12 md:h-12 md:top-8 md:left-8" />
                    <div
                        className="shape-circle absolute w-12 h-12 bg-linear-to-r from-teal-500/20 to-cyan-500/20 rounded-full top-40 right-32 md:w-8 md:h-8 md:top-24 md:right-8"
                        style={{ animationDelay: "1s" }}
                    />
                    <div
                        className="shape-ring absolute w-16 h-16 border-2 border-cyan-500/30 rounded-full bottom-32 left-40 md:w-10 md:h-10 md:bottom-16 md:left-8"
                        style={{ animationDelay: "2s" }}
                    />
                </div>

                <div
                    className={`text-center flex flex-col gap-8 md:gap-6 relative z-10 transition-all duration-1000 ease-out ${
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                >
                    {/* Main 404 Text */}
                    <div className="relative">
                        <h1
                            className={`text-404 text-[clamp(4rem,15vw,9rem)] font-black text-white tracking-widest m-0 relative transition-all duration-200 ${
                                glitchActive ? "glitch-active" : ""
                            }`}
                        >
                            404
                        </h1>

                        {/* Glitch overlay */}
                        {glitchActive && (
                            <>
                                <h1 className="text-404-glitch absolute inset-0 text-[clamp(4rem,15vw,9rem)] font-black tracking-widest m-0 opacity-70 text-red-500 translate-x-1 -translate-y-1">
                                    404
                                </h1>
                                <h1 className="text-404-glitch absolute inset-0 text-[clamp(4rem,15vw,9rem)] font-black tracking-widest m-0 opacity-70 text-cyan-500 -translate-x-1 translate-y-1">
                                    404
                                </h1>
                            </>
                        )}
                    </div>

                    {/* Subtitle */}
                    <div className="subtitle-container flex flex-col gap-4">
                        <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold text-white m-0">Oops! Page Not Found</h2>
                        <p className="text-gray-300 text-[clamp(1rem,2.5vw,1.25rem)] max-w-md mx-auto leading-relaxed m-0">
                            The page you're looking for seems to have vanished into the digital void. Don't worry, we'll
                            help you find your way back.
                        </p>
                    </div>

                    {/* Animated Icon */}
                    <div className="icon-container flex justify-center">
                        <div className="relative">
                            <Wifi className="wifi-icon w-16 h-16 text-teal-500" />
                            <div className="icon-pulse absolute inset-0 w-16 h-16 border-2 border-teal-500/30 rounded-full" />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="button-container flex justify-center">
                        <Button
                            onClick={() => router.back()}
                            variant="secondary"
                            className="border-2 border-teal-500 text-teal-500 bg-transparent hover:bg-teal-500 hover:text-white hover:shadow-[0_10px_25px_rgba(20,184,166,0.3)]"
                        >
                            <ArrowLeft />
                            Go Back
                        </Button>
                    </div>

                    {/* Error Code */}
                    <div className="error-code">
                        <p className="text-xs text-gray-500 font-mono m-0">ERROR_CODE: PAGE_NOT_FOUND_404</p>
                    </div>
                </div>
            </div>
            <style>{`
                @import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap");
                
                * {
                    font-family: "Comfortaa", cursive;
                }
                
                @keyframes pulse-particle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                
                @keyframes spin-shape {
                    from { transform: rotate(45deg); }
                    to { transform: rotate(405deg); }
                }
                
                @keyframes bounce-shape {
                    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
                    40%, 43% { transform: translateY(-0.75rem); }
                    70% { transform: translateY(-0.375rem); }
                    90% { transform: translateY(-0.125rem); }
                }
                
                @keyframes ping-pulse {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                
                @keyframes glitch-shake {
                    0%, 100% { transform: skewX(0deg); }
                    25% { transform: skewX(2deg) translateX(2px); }
                    50% { transform: skewX(-1deg) translateX(-1px); }
                    75% { transform: skewX(1deg) translateX(1px); }
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(1.25rem); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .particle {
                    animation: pulse-particle 2s infinite;
                }
                
                .shape-square {
                    animation: spin-shape 20s linear infinite;
                }
                
                .shape-circle {
                    animation: bounce-shape 2s infinite;
                }
                
                .shape-ring {
                    animation: pulse-particle 3s infinite;
                }
                
                .wifi-icon {
                    animation: pulse-particle 2s infinite;
                }
                
                .icon-pulse {
                    animation: ping-pulse 2s infinite;
                }
                
                .text-404 {
                    text-shadow: 
                        4px 4px 0px #14b8a6,
                        8px 8px 0px #0891b2,
                        12px 12px 0px #0e7490,
                        16px 16px 0px #155e75,
                        20px 20px 0px #164e63,
                        0 0 20px rgba(20, 184, 166, 0.5),
                        0 0 40px rgba(20, 184, 166, 0.3),
                        0 0 60px rgba(20, 184, 166, 0.2);
                }
                
                .text-404.glitch-active {
                    animation: glitch-shake 0.2s ease-in-out;
                }
                
                .text-404-glitch {
                    text-shadow: 
                        2px 2px 0px currentColor,
                        4px 4px 0px currentColor,
                        6px 6px 0px currentColor,
                        8px 8px 0px currentColor;
                }
                
                .subtitle-container {
                    animation: fade-in 0.8s ease-out 0.5s forwards;
                    opacity: 0;
                }
                
                .icon-container {
                    animation: fade-in 0.8s ease-out 1s forwards;
                    opacity: 0;
                }
                
                .button-container {
                    animation: fade-in 0.8s ease-out 1.3s forwards;
                    opacity: 0;
                }
                
                .error-code {
                    animation: fade-in 0.8s ease-out 1.6s forwards;
                    opacity: 0;
                }
            `}</style>
        </>
    )
}
