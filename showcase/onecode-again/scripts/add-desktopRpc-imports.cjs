#!/usr/bin/env node
/**
 * Add missing desktopRpc imports to files that use it
 */

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if file uses desktopRpc
  if (!content.includes('desktopRpc')) {
    return false;
  }
  
  // Check if already imports desktopRpc
  if (content.includes('from "../../lib/desktop-rpc"') || 
      content.includes('from "@/lib/desktop-rpc"')) {
    return false;
  }
  
  // Add import
  const importLine = 'import { desktopRpc } from "../../lib/desktop-rpc";\n';
  
  // Find the last import and add after it
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importLine.trim());
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
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

const srcDir = path.join(__dirname, '../src/mainview');
const files = findFiles(srcDir, ['.ts', '.tsx']);

let modified = 0;
for (const file of files) {
  if (processFile(file)) modified++;
}

console.log(`\nAdded imports to ${modified} files`);
