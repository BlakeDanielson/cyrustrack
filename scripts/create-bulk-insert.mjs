/**
 * Create a single bulk INSERT statement with all rows
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all single-line statements
const content = fs.readFileSync(path.join(__dirname, 'migration-single-line.sql'), 'utf-8');
const statements = content.split('\n').filter(line => line.trim());

console.log(`Processing ${statements.length} statements...`);

// Extract VALUES from each INSERT statement
const valuesRows = [];
for (const stmt of statements) {
  // Extract the VALUES(...) part
  const match = stmt.match(/VALUES\s*\(\s*(.*)\s*\);$/i);
  if (match) {
    valuesRows.push(`(${match[1]})`);
  }
}

console.log(`Extracted ${valuesRows.length} value rows`);

// Create bulk INSERT - split into chunks of 50 rows to avoid query size limits
const chunkSize = 50;
const chunks = [];

for (let i = 0; i < valuesRows.length; i += chunkSize) {
  const chunk = valuesRows.slice(i, i + chunkSize);
  const bulkInsert = `INSERT INTO consumption_sessions (
  id, date, time, location, who_with, vessel, accessory_used,
  my_vessel, my_substance, strain_name, strain_type, thc_percentage,
  purchased_legally, state_purchased, tobacco, kief, concentrate, lavender,
  quantity, comments, created_at, updated_at
) VALUES
${chunk.join(',\n')};`;
  
  chunks.push(bulkInsert);
}

console.log(`Created ${chunks.length} bulk insert chunks`);

// Write each chunk to a separate file
for (let i = 0; i < chunks.length; i++) {
  const filename = `bulk_insert_${String(i + 1).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(__dirname, filename), chunks[i]);
  console.log(`Written ${filename} (${chunks[i].length} bytes)`);
}

console.log('\nDone! Execute these SQL files in order.');
