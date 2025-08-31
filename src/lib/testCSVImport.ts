import { parseCSVContent, validateCSVFormat } from './csvImport';

// Your sample data as a string (tab-separated)
const sampleCSVData = `Instance (Blake Tracking)	Day of Week	When	Location	City	State	Alone?	People	Vessel	Accessory Used	Your Vessel	Your Substance	Strain	Type	THC %	Legal Product_Purchased?	State Purchased?	Tobacco	Kief	Concentrate	Lavendar	Quantity	Comments
1	Monday	10/17/22 11:39 AM	Brentwood Buddies	College Station	TX	Y		Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Medium	
2	Monday	10/17/22 4:07 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Small	
3	Monday	10/17/22 4:50 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Pen_Cyrus Mortazavi	N/A	N	N	King Louis	Indica		N			N	Y	N	Hits_2	
4	Monday	10/17/22 8:30 PM	Brentwood Buddies	College Station	TX	Y		Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Small	
5	Tuesday	10/18/22 11:27 AM	Brentwood Buddies	College Station	TX	Y		Pen_Cyrus Mortazavi	N/A	N	N	King Louis	Indica		N			N	Y	N	Hits_3	
6	Tuesday	10/18/22 6:40 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Kush Mints	Hybrid		N			N	N	N	Small	
7	Tuesday	10/18/22 9:50 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Tony Runtz	Hybrid		N			N	N	N	Large	
8	Wednesday	10/19/22 3:42 PM	Brentwood Buddies	College Station	TX	Y		Classic Bubbler	Bowl_Rounded	Y	Y	Tony Runtz	Hybrid		N			N	N	N	Tiny	
9	Wednesday	10/19/22 6:04 PM	Brentwood Buddies	College Station	TX	N	Will Ringler;	Classic Bubbler	Bowl_Rounded	Y	Y	Tony Runtz	Hybrid		N			N	N	N	Small	`;

// Test function to validate the import
export function testCSVImport() {
  console.log('🧪 Testing CSV Import with your sample data...\n');
  
  // 1. Validate format
  console.log('1. Validating CSV format...');
  const validation = validateCSVFormat(sampleCSVData);
  
  if (!validation.valid) {
    console.error('❌ Validation failed:', validation.errors);
    return false;
  }
  
  console.log('✅ CSV format is valid');
  
  // 2. Parse sessions
  console.log('\n2. Parsing sessions...');
  try {
    const sessions = parseCSVContent(sampleCSVData);
    console.log(`✅ Successfully parsed ${sessions.length} sessions`);
    
    // 3. Show sample converted data
    console.log('\n3. Sample converted session (first row):');
    const firstSession = sessions[0];
    console.log(JSON.stringify(firstSession, null, 2));
    
    // 4. Test specific mappings
    console.log('\n4. Testing vessel and quantity mappings:');
    sessions.forEach((session, index) => {
      const originalRow = sampleCSVData.split('\n')[index + 1].split('\t');
      console.log(`Row ${index + 1}:`);
      console.log(`  Original vessel: "${originalRow[8]}" → Mapped: "${session.vessel}"`);
      console.log(`  Original quantity: "${originalRow[21]}" → Mapped: ${JSON.stringify(session.quantity)}`);
      console.log(`  Date/Time: "${originalRow[2]}" → Date: "${session.date}", Time: "${session.time}"`);
      console.log(`  Location: "${originalRow[3]}, ${originalRow[4]}, ${originalRow[5]}" → "${session.location}"`);
      console.log('');
    });
    
    // 5. Test edge cases
    console.log('5. Testing edge cases:');
    const vapeSession = sessions.find(s => s.vessel === 'Vape Pen');
    if (vapeSession) {
      console.log('✅ Vape pen session found with hits quantity:', vapeSession.quantity);
    }
    
    const bongSessions = sessions.filter(s => s.vessel === 'Bong');
    console.log(`✅ Found ${bongSessions.length} bong sessions (mapped from Classic Bubbler)`);
    
    const soloSessions = sessions.filter(s => s.who_with === 'Solo');
    const groupSessions = sessions.filter(s => s.who_with !== 'Solo');
    console.log(`✅ Found ${soloSessions.length} solo sessions and ${groupSessions.length} group sessions`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Parsing failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testCSVImport();
}
