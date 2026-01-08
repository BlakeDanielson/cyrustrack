/**
 * Execute Migration Batches
 * Reads batch files and outputs JSON for Neon MCP
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all batch files
const batchFiles = fs.readdirSync(__dirname)
  .filter(f => f.startsWith('batch_'))
  .sort();

console.log(`Found ${batchFiles.length} batch files`);

// Process each batch
for (const batchFile of batchFiles) {
  const content = fs.readFileSync(path.join(__dirname, batchFile), 'utf-8');
  const statements = content.split('\n').filter(line => line.trim());
  
  console.log(`\n=== ${batchFile}: ${statements.length} statements ===`);
  
  // Output as JSON array for Neon MCP
  const jsonPath = path.join(__dirname, `${batchFile}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(statements, null, 2));
  console.log(`Written to ${jsonPath}`);
}

console.log('\nDone! JSON files ready for Neon MCP execution.');
