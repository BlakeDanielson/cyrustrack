/**
 * Execute Neon Migration using @neondatabase/serverless
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = 'postgresql://neondb_owner:npg_Fdag8lUcbIf0@ep-lingering-paper-adg6dn4k-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function runMigration() {
  // Read all statements
  const content = fs.readFileSync(path.join(__dirname, 'migration-single-line.sql'), 'utf-8');
  const statements = content.split('\n').filter(line => line.trim());
  
  console.log(`Total statements to execute: ${statements.length}`);
  
  let completed = 0;
  let errors = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    try {
      // Use tagged template literal - wrap the statement
      await sql([stmt]);
      completed++;
      
      // Log progress every 100 statements
      if (completed % 100 === 0) {
        console.log(`Progress: ${completed}/${statements.length} (${Math.round(completed/statements.length*100)}%)`);
      }
    } catch (err) {
      console.error(`Error at statement ${i}:`, err.message);
      console.error(`Statement: ${stmt.substring(0, 100)}...`);
      errors++;
    }
  }
  
  console.log(`\nMigration complete!`);
  console.log(`Successful: ${completed}`);
  console.log(`Errors: ${errors}`);
}

runMigration().catch(console.error);
