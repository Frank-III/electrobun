import path from "node:path";
import { rmSync } from "node:fs";

const projectRoot = path.resolve(import.meta.dir, "..");
const buildDir = path.resolve(projectRoot, "build");

rmSync(buildDir, { recursive: true, force: true });
console.log(`[clean-build] Removed ${buildDir}`);
