/**
 * Execute Migration using Prisma
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

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
      await prisma.$executeRawUnsafe(stmt);
      completed++;
      
      // Log progress every 100 statements
      if (completed % 100 === 0) {
        console.log(`Progress: ${completed}/${statements.length} (${Math.round(completed/statements.length*100)}%)`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Error at statement ${i}:`, error.message);
      console.error(`Statement: ${stmt.substring(0, 100)}...`);
      errors++;
    }
  }
  
  console.log(`\nMigration complete!`);
  console.log(`Successful: ${completed}`);
  console.log(`Errors: ${errors}`);
  
  // Verify count
  const count = await prisma.consumptionSession.count();
  console.log(`Total sessions in database: ${count}`);
  
  await prisma.$disconnect();
}

runMigration().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
