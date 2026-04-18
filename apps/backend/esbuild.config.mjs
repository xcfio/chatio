import esbuild from "esbuild"
import pkg from "./package.json" with { type: "json" }

const deps = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies
}).filter((d) => d !== "schema")

await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "out/index.js",
    format: "cjs",
    external: deps
})
