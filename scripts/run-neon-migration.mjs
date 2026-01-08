/**
 * Run Neon Migration via direct psql
 * Reads the single-line SQL file and outputs for direct execution
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all statements
const content = fs.readFileSync(path.join(__dirname, 'migration-single-line.sql'), 'utf-8');
const statements = content.split('\n').filter(line => line.trim());

console.log(`Total statements: ${statements.length}`);

// Write a combined SQL file that can be executed directly
const combinedSql = statements.join('\n');
fs.writeFileSync(path.join(__dirname, 'migration-combined.sql'), combinedSql);
console.log('Written migration-combined.sql');
