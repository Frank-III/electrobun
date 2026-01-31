#!/usr/bin/env node
/**
 * Migration script v2 - Update remaining window.desktopApi calls
 * Run: node scripts/migrate-desktop-api-v2.cjs
 */

const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  // System/Version
  {
    pattern: /window\.desktopApi\?\.getVersion\(\)/g,
    replacement: 'desktopRpc.system.getVersion()'
  },
  {
    pattern: /window\.desktopApi\?\.checkForUpdates\(\)/g,
    replacement: 'desktopRpc.system.checkForUpdates()'
  },
  {
    pattern: /window\.desktopApi\?\.downloadUpdate\(\)/g,
    replacement: 'desktopRpc.system.downloadUpdate.mutate()'
  },
  {
    pattern: /window\.desktopApi\?\.installUpdate\(\)/g,
    replacement: 'desktopRpc.system.installUpdate.mutate()'
  },
  // Clipboard
  {
    pattern: /window\.desktopApi\?\.clipboardWrite\(([^)]+)\)/g,
    replacement: 'desktopRpc.system.clipboardWrite.mutate({ text: $1 })'
  },
  {
    pattern: /window\.desktopApi\?\.clipboardRead\(\)/g,
    replacement: 'desktopRpc.system.clipboardRead()'
  },
  // Shortcuts (complex - needs GlobalShortcut registration in Bun)
  {
    pattern: /window\.desktopApi\?\.onShortcutNewAgent/g,
    replacement: '// TODO: Use GlobalShortcut API in Bun: GlobalShortcut.register("CmdOrCtrl+N", handler)'
  },
  // File watching (complex - needs implementation in Bun)
  {
    pattern: /window\.desktopApi\?\.watchFileChanges/g,
    replacement: '// TODO: Use fs.watchFile or custom watcher in Bun'
  },
  {
    pattern: /window\.desktopApi\?\.watchGitChanges/g,
    replacement: '// TODO: Use gitWatcherSubscribe RPC'
  },
  // Dev tools (complex - needs Electrobun support)
  {
    pattern: /window\.desktopApi\?\.toggleDevTools\(\)/g,
    replacement: '// TODO: Not available in Electrobun yet'
  },
  {
    pattern: /window\.desktopApi\?\.unlockDevTools\(\)/g,
    replacement: '// TODO: Not available in Electrobun yet'
  },
  // macOS-specific (no Electrobun equivalent)
  {
    pattern: /window\.desktopApi\?\.setTrafficLightVisibility\([^)]+\)/g,
    replacement: '// TODO: No Electrobun equivalent for setTrafficLightVisibility (macOS-specific)'
  },
  // newWindow (complex - needs event handling)
  {
    pattern: /window\.desktopApi\?\.newWindow/g,
    replacement: '// TODO: Handle via BrowserWindow "newWindowOpen" event'
  },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Check if file uses window.desktopApi
  if (!content.includes('window.desktopApi')) {
    return false;
  }
  
  // Apply replacements
  for (const { pattern, replacement } of REPLACEMENTS) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  // Add import if needed and not already present
  if (modified && !content.includes('desktopRpc') && !content.includes('from "../../lib/desktop-rpc"')) {
    const importLine = 'import { desktopRpc } from "../../lib/desktop-rpc";\n';
    if (content.includes('import ')) {
      // Find first import and add before it
      content = content.replace(/^(import .+)$/m, `${importLine}$1`);
    } else {
      // Add at the very top
      content = importLine + content;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ ${filePath}`);
    return true;
  }
  
  return false;
}

function findFiles(dir, extensions) {
  const files = [];
  
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main
const srcDir = path.join(__dirname, '../src/mainview');
const files = findFiles(srcDir, ['.ts', '.tsx']);

let processed = 0;
let modified = 0;

for (const file of files) {
  processed++;
  if (processFile(file)) {
    modified++;
  }
}

console.log(`\nProcessed ${processed} files, modified ${modified}`);
