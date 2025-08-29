import { ConsumptionSession, createQuantityValue } from '@/types/consumption';
import { v4 as uuidv4 } from 'uuid';

// Sample sessions with realistic coordinates for major US cities
export const sampleSessionsWithCoordinates: ConsumptionSession[] = [
  {
    id: uuidv4(),
    date: '2024-01-15',
    time: '19:30',
    location: 'Home',
    latitude: 37.7749,
    longitude: -122.4194,
    who_with: 'Solo',
    vessel: 'Joint',
    accessory_used: 'Grinder',
    my_vessel: true,
    my_substance: true,
    strain_name: 'Blue Dream',
    thc_percentage: 22,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: false,
    kief: false,
    concentrate: false,
    quantity: createQuantityValue('Joint', 0.25),
    created_at: new Date('2024-01-15T19:30:00').toISOString(),
    updated_at: new Date('2024-01-15T19:30:00').toISOString()
  },
  {
    id: uuidv4(),
    date: '2024-01-16',
    time: '21:00',
    location: 'Friend\'s House',
    latitude: 37.7849,
    longitude: -122.4094,
    who_with: 'Alex, Jamie',
    vessel: 'Bong',
    accessory_used: 'None',
    my_vessel: false,
    my_substance: false,
    strain_name: 'OG Kush',
    thc_percentage: 25,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: false,
    kief: true,
    concentrate: false,
    quantity: createQuantityValue('Bong', 'small'),
    created_at: new Date('2024-01-16T21:00:00').toISOString(),
    updated_at: new Date('2024-01-16T21:00:00').toISOString()
  },
  {
    id: uuidv4(),
    date: '2024-01-18',
    time: '16:45',
    location: 'Golden Gate Park',
    latitude: 37.7694,
    longitude: -122.4862,
    who_with: 'Solo',
    vessel: 'Vape Pen',
    accessory_used: 'None',
    my_vessel: true,
    my_substance: true,
    strain_name: 'Sour Diesel',
    thc_percentage: 28,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: false,
    kief: false,
    concentrate: true,
    quantity: createQuantityValue('Vape Pen', 5),
    created_at: new Date('2024-01-18T16:45:00').toISOString(),
    updated_at: new Date('2024-01-18T16:45:00').toISOString()
  },
  {
    id: uuidv4(),
    date: '2024-01-20',
    time: '20:15',
    location: 'Dispensary Lounge',
    latitude: 37.7849,
    longitude: -122.4294,
    who_with: 'Casey',
    vessel: 'Dab Rig',
    accessory_used: 'Dab Tool',
    my_vessel: false,
    my_substance: false,
    strain_name: 'Gorilla Glue #4',
    thc_percentage: 32,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: false,
    kief: false,
    concentrate: true,
    quantity: createQuantityValue('Dab Rig', 0.1),
    created_at: new Date('2024-01-20T20:15:00').toISOString(),
    updated_at: new Date('2024-01-20T20:15:00').toISOString()
  },
  {
    id: uuidv4(),
    date: '2024-01-22',
    time: '18:30',
    location: 'Rooftop',
    latitude: 37.7949,
    longitude: -122.4094,
    who_with: 'Solo',
    vessel: 'Joint',
    accessory_used: 'Rolling Papers',
    my_vessel: true,
    my_substance: true,
    strain_name: 'Sunset Sherbet',
    thc_percentage: 20,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: false,
    kief: false,
    concentrate: false,
    quantity: createQuantityValue('Joint', 0.5),
    created_at: new Date('2024-01-22T18:30:00').toISOString(),
    updated_at: new Date('2024-01-22T18:30:00').toISOString()
  },
  {
    id: uuidv4(),
    date: '2024-01-25',
    time: '22:00',
    location: 'Home',
    latitude: 37.7749,
    longitude: -122.4194,
    who_with: 'Partner',
    vessel: 'Pipe',
    accessory_used: 'Lighter',
    my_vessel: true,
    my_substance: true,
    strain_name: 'Purple Haze',
    thc_percentage: 24,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: false,
    kief: true,
    concentrate: false,
    quantity: createQuantityValue('Pipe', 'medium'),
    created_at: new Date('2024-01-25T22:00:00').toISOString(),
    updated_at: new Date('2024-01-25T22:00:00').toISOString()
  },
  {
    id: uuidv4(),
    date: '2024-01-28',
    time: '17:20',
    location: 'Beach',
    latitude: 37.7849,
    longitude: -122.5094,
    who_with: 'Group of friends',
    vessel: 'Joint',
    accessory_used: 'Grinder',
    my_vessel: true,
    my_substance: false,
    strain_name: 'Wedding Cake',
    thc_percentage: 26,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: true,
    kief: false,
    concentrate: false,
    quantity: createQuantityValue('Joint', 0.75),
    created_at: new Date('2024-01-28T17:20:00').toISOString(),
    updated_at: new Date('2024-01-28T17:20:00').toISOString()
  },
  {
    id: uuidv4(),
    date: '2024-02-02',
    time: '19:45',
    location: 'Coffee Shop',
    latitude: 37.7649,
    longitude: -122.4394,
    who_with: 'Solo',
    vessel: 'Edibles',
    accessory_used: 'None',
    my_vessel: true,
    my_substance: true,
    strain_name: 'Girl Scout Cookies',
    thc_percentage: 15,
    purchased_legally: true,
    state_purchased: 'California',
    tobacco: false,
    kief: false,
    concentrate: false,
    quantity: createQuantityValue('Edibles', 10),
    created_at: new Date('2024-02-02T19:45:00').toISOString(),
    updated_at: new Date('2024-02-02T19:45:00').toISOString()
  }
];

// Function to load sample data
export const loadSampleData = () => {
  const existingData = localStorage.getItem('cannabis-tracker-sessions');
  const existing = existingData ? JSON.parse(existingData) : [];
  
  // Only add sample data if no data exists
  if (existing.length === 0) {
    localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(sampleSessionsWithCoordinates));
    return sampleSessionsWithCoordinates;
  }
  
  return existing;
};

// Function to add sample data regardless of existing data (for demo purposes)
export const addSampleData = () => {
  const existingData = localStorage.getItem('cannabis-tracker-sessions');
  const existing = existingData ? JSON.parse(existingData) : [];
  
  const combined = [...existing, ...sampleSessionsWithCoordinates];
  localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(combined));
  
  return combined;
};
