#!/usr/bin/env node
/**
 * Batch migration script to replace window.desktopApi with desktopRpc
 * Run: node scripts/migrate-desktop-api.js
 */

const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  // Window controls
  {
    pattern: /window\.desktopApi\?\.openExternal\(([^)]+)\)/g,
    replacement: 'desktopRpc.external.openExternal.mutate({ url: $1 })'
  },
  {
    pattern: /window\.desktopApi\?\.windowMinimize\(\)/g,
    replacement: 'desktopRpc.window.minimize.mutate()'
  },
  {
    pattern: /window\.desktopApi\?\.windowMaximize\(\)/g,
    replacement: 'desktopRpc.window.maximize.mutate()'
  },
  {
    pattern: /window\.desktopApi\?\.windowClose\(\)/g,
    replacement: 'desktopRpc.window.close.mutate()'
  },
  {
    pattern: /window\.desktopApi\?\.windowIsMaximized\(\)/g,
    replacement: 'desktopRpc.window.isMaximized()'
  },
  {
    pattern: /window\.desktopApi\?\.windowIsFullscreen\(\)/g,
    replacement: 'desktopRpc.window.isFullscreen()'
  },
  {
    pattern: /window\.desktopApi\?\.windowToggleFullscreen\(\)/g,
    replacement: 'desktopRpc.window.toggleFullscreen.mutate()'
  },
  {
    pattern: /window\.desktopApi\?\.setWindowTitle\(([^)]+)\)/g,
    replacement: 'desktopRpc.window.setTitle.mutate({ title: $1 })'
  },
  // Notifications
  {
    pattern: /window\.desktopApi\?\.showNotification\(([^)]+)\)/g,
    replacement: 'desktopRpc.notifications.show.mutate($1)'
  },
  {
    pattern: /window\.desktopApi\?\.setBadge\(([^)]+)\)/g,
    replacement: 'desktopRpc.notifications.setBadge.mutate({ count: $1 })'
  },
  // External
  {
    pattern: /window\.desktopApi\?\.openInFinder\(([^)]+)\)/g,
    replacement: 'desktopRpc.external.openInFinder.mutate({ path: $1 })'
  },
  {
    pattern: /window\.desktopApi\?\.openFileInEditor\(([^)]+)\)/g,
    replacement: 'desktopRpc.external.openFileInEditor($1)'
  },
];

const IMPORT_REPLACEMENTS = [
  {
    pattern: /import.*from "\.\.\/..\/lib\/electrobun-rpc"/g,
    replacement: 'import { desktopRpc } from "../../lib/desktop-rpc"'
  }
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
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  }
  
  // Add import if needed
  if (modified && !content.includes('desktopRpc')) {
    // Add import at the top
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
