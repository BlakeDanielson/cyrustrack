const fs = require('fs');
const path = require('path');

// Sample CSV data exactly as you provided it
const sampleData = `Instance (Blake Tracking)	Day of Week	When	Location	City	State	Alone?	People	Vessel	Accessory Used	Your Vessel	Your Substance	Strain	Type	THC %	Legal Product_Purchased?	State Purchased?	Tobacco	Kief	Concentrate	Lavendar	Quantity	Comments
1	Monday	10/17/22 11:39 AM	Brentwood Buddies	College Station	TX	Y		Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Medium	
2	Monday	10/17/22 4:07 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Small	
3	Monday	10/17/22 4:50 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Pen_Cyrus Mortazavi	N/A	N	N	King Louis	Indica		N			N	Y	N	Hits_2	
4	Monday	10/17/22 8:30 PM	Brentwood Buddies	College Station	TX	Y		Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Small	
5	Tuesday	10/18/22 11:27 AM	Brentwood Buddies	College Station	TX	Y		Pen_Cyrus Mortazavi	N/A	N	N	King Louis	Indica		N			N	Y	N	Hits_3	
6	Tuesday	10/18/22 6:40 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Small	
7	Tuesday	10/18/22 9:50 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Tony Runtz	Hybrid		N			N	N	N	Large	
8	Wednesday	10/19/22 3:42 PM	Brentwood Buddies	College Station	TX	Y		Classic Bubbler	Bowl_Rounded	Y	Y	Tony Runtz	Hybrid		N			N	N	N	Tiny	
9	Wednesday	10/19/22 6:04 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Tony Runtz	Hybrid		N			N	N	N	Small	`;

// Write sample data to a test file
const testFilePath = path.join(__dirname, 'test-data.tsv');
fs.writeFileSync(testFilePath, sampleData);

console.log('✅ Created test CSV file:', testFilePath);
console.log('\n📋 Test Instructions:');
console.log('1. Start your development server: npm run dev');
console.log('2. Navigate to your cannabis tracker app');
console.log('3. Look for an "Import" button or add the CSVImportDialog to your UI');
console.log('4. Upload the file:', testFilePath);
console.log('5. The CSV should import 9 sessions successfully');

console.log('\n🔧 Expected Transformations:');
console.log('- "Classic Bubbler" → "Bong"');
console.log('- "Pen_Cyrus Mortazavi" → "Vape Pen"');
console.log('- "Bowl_Rounded" → "Glass Screen"');
console.log('- "10/17/22 11:39 AM" → date: "2022-10-17", time: "11:39"');
console.log('- "Medium", "Small", etc. → size_category quantity');
console.log('- "Hits_2", "Hits_3" → decimal quantity for vape pens');
console.log('- "Y"/"N" → true/false booleans');
console.log('- "Will Ringler;" → "Will Ringler" (cleaned)');

console.log('\n🧪 To test the CSV parser directly:');
console.log('Run: node -e "require(\'./src/lib/testCSVImport.ts\').testCSVImport()"');
