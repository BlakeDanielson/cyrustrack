#!/usr/bin/env npx tsx

/**
 * CLI script to migrate CSV data to the database
 * Usage: npx tsx scripts/migrate-csv.ts <csv-file-path> [--dry-run]
 */

import { migrateCsvData, validateCsvData } from '../src/lib/csv-migration';
import { existsSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/migrate-csv.ts <csv-file-path> [--dry-run]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run    Validate CSV data without inserting into database');
    console.log('  --help       Show this help message');
    process.exit(1);
  }
  
  if (args.includes('--help')) {
    console.log('CSV Migration Tool');
    console.log('');
    console.log('This tool migrates historical consumption data from CSV format');
    console.log('to your Neon PostgreSQL database.');
    console.log('');
    console.log('Usage: npx tsx scripts/migrate-csv.ts <csv-file-path> [--dry-run]');
    console.log('');
    console.log('CSV Format Expected:');
    console.log('  Instance (Blake Tracking), Day of Week, When, Location, City, State,');
    console.log('  Alone?, People, Vessel, Accessory Used, Your Vessel, Your Substance,');
    console.log('  Strain, Type, THC %, Legal Product_Purchased?, State Purchased?,');
    console.log('  Tobacco, Kief, Concentrate, Lavendar, Quantity, Comments');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run    Validate CSV data without inserting into database');
    console.log('  --help       Show this help message');
    process.exit(0);
  }
  
  const csvFilePath = resolve(args[0]);
  const isDryRun = args.includes('--dry-run');
  
  // Validate file exists
  if (!existsSync(csvFilePath)) {
    console.error(`Error: CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }
  
  console.log('Cannabis Consumption Data Migration Tool');
  console.log('=======================================');
  console.log(`CSV File: ${csvFilePath}`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (validation only)' : 'LIVE MIGRATION'}`);
  console.log('');
  
  if (isDryRun) {
    console.log('🔍 Validating CSV data...');
    try {
      const validation = await validateCsvData(csvFilePath);
      
      console.log('\n=== Validation Results ===');
      console.log(`Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`Vessels found: ${validation.vesselsFound.join(', ')}`);
      
      if (validation.issues.length > 0) {
        console.log('\n=== Issues Found ===');
        validation.issues.forEach(issue => console.log(`❌ ${issue}`));
      }
      
      if (validation.sampleTransformations.length > 0) {
        console.log('\n=== Sample Transformations ===');
        validation.sampleTransformations.forEach((sample, index) => {
          console.log(`\n--- Sample ${index + 1} ---`);
          console.log('Original:', JSON.stringify(sample.original, null, 2));
          console.log('Transformed:', JSON.stringify(sample.transformed, null, 2));
        });
      }
      
      if (validation.isValid) {
        console.log('\n✅ CSV data is valid and ready for migration!');
        console.log('Run without --dry-run to perform the actual migration.');
      } else {
        console.log('\n❌ Please fix the issues above before running the migration.');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
    
  } else {
    console.log('🚀 Starting migration...');
    console.log('⚠️  This will insert data into your production database!');
    console.log('');
    
    // Add a 3-second delay to give user time to cancel
    console.log('Starting in 3 seconds... (Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Starting in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Starting in 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Starting migration now!');
    console.log('');
    
    try {
      const stats = await migrateCsvData(csvFilePath);
      
      console.log('\n=== Final Migration Report ===');
      console.log(`📊 Total rows processed: ${stats.totalRows}`);
      console.log(`✅ Successful inserts: ${stats.successfulInserts}`);
      console.log(`❌ Errors: ${stats.errors.length}`);
      console.log(`🗺️  Geocoding successful: ${stats.geocodingResults.successful}`);
      console.log(`🚫 Geocoding failed: ${stats.geocodingResults.failed}`);
      console.log(`🔧 New vessels found: ${stats.newVessels.join(', ')}`);
      
      if (stats.errors.length > 0) {
        console.log('\n=== Error Details ===');
        stats.errors.forEach(error => {
          console.log(`❌ Row ${error.row}: ${error.error}`);
        });
      }
      
      const successRate = (stats.successfulInserts / stats.totalRows) * 100;
      console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);
      
      if (successRate === 100) {
        console.log('🎉 Migration completed successfully!');
      } else if (successRate >= 90) {
        console.log('✅ Migration mostly successful with minor issues.');
      } else {
        console.log('⚠️  Migration completed with significant issues. Please review errors.');
      }
      
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Migration cancelled by user.');
  process.exit(0);
});

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

