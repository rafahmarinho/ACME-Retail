import { runSeed } from "../src/lib/seed/run"

const result = await runSeed()
console.log(JSON.stringify(result, null, 2))
