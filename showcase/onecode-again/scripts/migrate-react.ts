#!/usr/bin/env bun
/**
 * One-time React → Solid migration script
 * 
 * Usage:
 *   bun scripts/migrate-react.ts src/path/to/file.tsx
 *   bun scripts/migrate-react.ts src/path/to/file.tsx --write  # overwrite file
 *   bun scripts/migrate-react.ts "src/components/*.tsx" --write # batch migrate
 */

import oxc from "solid-jsx-oxc";
import { Glob } from "bun";

// Use migrateReact for migration-only (no JSX compilation)
const migrateReact = oxc.migrateReact as (input: string, options: Record<string, unknown>) => {
  code: string;
};

const migrateConfig = {
  attributes: true,  // className → class
  hooks: true,       // useState → createSignal
  imports: true,     // react → solid-js
  jotai: false,      // TODO: enable when ready
};

async function migrateFile(filePath: string, write: boolean): Promise<{ path: string; success: boolean; error?: string }> {
  try {
    const source = await Bun.file(filePath).text();
    const { code } = migrateReact(source, migrateConfig);
    
    if (write) {
      await Bun.write(filePath, code);
      console.log(`✅ ${filePath}`);
    } else {
      console.log(`\n${"=".repeat(60)}\n📄 ${filePath}\n${"=".repeat(60)}\n`);
      console.log(code);
    }
    
    return { path: filePath, success: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error(`❌ ${filePath}: ${error}`);
    return { path: filePath, success: false, error };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const patterns = args.filter(a => !a.startsWith("--"));
  
  if (patterns.length === 0) {
    console.log(`
React → Solid Migration Tool

Usage:
  bun scripts/migrate-react.ts <file-or-glob> [--write]

Examples:
  bun scripts/migrate-react.ts src/App.tsx                    # Preview migration
  bun scripts/migrate-react.ts src/App.tsx --write            # Overwrite file
  bun scripts/migrate-react.ts "src/**/*.tsx" --write         # Batch migrate

Transforms:
  • className → class
  • htmlFor → for  
  • useState → createSignal
  • useMemo → createMemo
  • useEffect → createEffect
  • useCallback → inline (removed)
  • import from "react" → import from "solid-js"
`);
    process.exit(0);
  }
  
  let files: string[] = [];
  
  for (const pattern of patterns) {
    if (pattern.includes("*")) {
      const glob = new Glob(pattern);
      for await (const file of glob.scan(".")) {
        files.push(file);
      }
    } else {
      files.push(pattern);
    }
  }
  
  if (files.length === 0) {
    console.error("No files matched the pattern(s)");
    process.exit(1);
  }
  
  console.log(`\n🔄 Migrating ${files.length} file(s)${write ? " (writing changes)" : " (preview mode)"}...\n`);
  
  const results = await Promise.all(files.map(f => migrateFile(f, write)));
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n📊 Done: ${succeeded} succeeded, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

main();
