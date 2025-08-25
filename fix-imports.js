const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix import statements that don't have .js extension
    // Pattern 1: import { ... } from "path"
    const importPattern1 = /import\s*{([^}]+)}\s+from\s+['"]([^'"]*?)['"];?/g;
    let match1;
    
    while ((match1 = importPattern1.exec(content)) !== null) {
      const importPath = match1[2];
      
      // Skip if it's already a .js file or external package
      if (importPath.endsWith('.js') || importPath.startsWith('.') === false) {
        continue;
      }
      
      // Skip if it's a directory import (ends with /)
      if (importPath.endsWith('/')) {
        continue;
      }
      
      // Add .js extension for relative imports
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const newImportPath = importPath + '.js';
        const oldImport = match1[0];
        const newImport = oldImport.replace(importPath, newImportPath);
        content = content.replace(oldImport, newImport);
        modified = true;
        console.log(`Fixed import in ${filePath}: ${importPath} -> ${newImportPath}`);
      }
    }
    
    // Pattern 2: import default from "path"
    const importPattern2 = /import\s+(\w+)\s+from\s+['"]([^'"]*?)['"];?/g;
    let match2;
    
    while ((match2 = importPattern2.exec(content)) !== null) {
      const importPath = match2[2];
      
      // Skip if it's already a .js file or external package
      if (importPath.endsWith('.js') || importPath.startsWith('.') === false) {
        continue;
      }
      
      // Skip if it's a directory import (ends with /)
      if (importPath.endsWith('/')) {
        continue;
      }
      
      // Add .js extension for relative imports
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const newImportPath = importPath + '.js';
        const oldImport = match2[0];
        const newImport = oldImport.replace(importPath, newImportPath);
        content = content.replace(oldImport, newImport);
        modified = true;
        console.log(`Fixed import in ${filePath}: ${importPath} -> ${newImportPath}`);
      }
    }
    
    // Pattern 3: import * as name from "path"
    const importPattern3 = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]*?)['"];?/g;
    let match3;
    
    while ((match3 = importPattern3.exec(content)) !== null) {
      const importPath = match3[2];
      
      // Skip if it's already a .js file or external package
      if (importPath.endsWith('.js') || importPath.startsWith('.') === false) {
        continue;
      }
      
      // Skip if it's a directory import (ends with /)
      if (importPath.endsWith('/')) {
        continue;
      }
      
      // Add .js extension for relative imports
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const newImportPath = importPath + '.js';
        const oldImport = match3[0];
        const newImport = oldImport.replace(importPath, newImportPath);
        content = content.replace(oldImport, newImport);
        modified = true;
        console.log(`Fixed import in ${filePath}: ${importPath} -> ${newImportPath}`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      fixImportsInFile(filePath);
    }
  }
}

// Process the backend/src directory
const backendSrcPath = path.join(__dirname, 'backend', 'src');
console.log('Fixing imports in:', backendSrcPath);
processDirectory(backendSrcPath);
console.log('Import fixing completed!');
