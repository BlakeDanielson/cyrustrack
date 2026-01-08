/**
 * Execute all bulk insert batches using @neondatabase/serverless
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Fdag8lUcbIf0@ep-lingering-paper-adg6dn4k-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function runBatches() {
  // Get all bulk insert files
  const files = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('bulk_insert_') && f.endsWith('.sql'))
    .sort();
  
  console.log(`Found ${files.length} batch files`);
  
  let totalRows = 0;
  let completed = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf-8');
    
    try {
      // Execute the SQL directly using tagged template literal
      await sql.unsafe(content);
      completed++;
      
      // Count rows (50 per batch, 28 for last)
      const rowCount = file === 'bulk_insert_37.sql' ? 28 : 50;
      totalRows += rowCount;
      
      console.log(`✓ ${file} (${rowCount} rows) - Total: ${totalRows}`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Batches: ${completed}/${files.length}`);
  console.log(`Total rows inserted: ${totalRows}`);
  
  // Verify count
  const result = await sql`SELECT COUNT(*) as count FROM consumption_sessions`;
  console.log(`Database count: ${result[0].count}`);
}

runBatches().catch(console.error);
