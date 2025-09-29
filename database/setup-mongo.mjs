// MongoDB setup for Carmen Sandiego game
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// MongoDB connection (use environment variable)
const MONGODB_URI = process.env.MONGODB_URI;

const client = new MongoClient(MONGODB_URI);

async function setupMongoDatabase() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('Make sure .env.local file exists with MONGODB_URI');
    process.exit(1);
  }
  
  try {
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const db = client.db('carmen-sandiego');
    
    // Create collections and sample data
    console.log('🔄 Setting up game data...');
    
    // Villains collection
    const villains = [
      { 
        _id: 'carmen_sandiego',
        name: 'Carmen Sandiego',
        description: 'The elusive master thief with a red trench coat',
        difficulty: 'expert',
        specialties: ['stealth', 'disguise', 'international_travel']
      },
      {
        _id: 'vic_the_slick',
        name: 'Vic the Slick',
        description: 'A smooth-talking con artist',
        difficulty: 'medium', 
        specialties: ['forgery', 'charm', 'quick_escape']
      },
      {
        _id: 'sarah_nade',
        name: 'Sarah Nade',
        description: 'An explosives expert',
        difficulty: 'hard',
        specialties: ['demolition', 'chemistry', 'precision']
      }
    ];
    
    await db.collection('villains').deleteMany({});
    await db.collection('villains').insertMany(villains);
    console.log(`✅ Created ${villains.length} villains`);
    
    // Locations collection
    const locations = [
      {
        _id: 'new_york',
        name: 'New York City',
        country: 'United States',
        continent: 'North America',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        landmarks: ['Statue of Liberty', 'Empire State Building', 'Central Park'],
        clues: [
          'I saw someone by a large green statue holding a torch',
          'They mentioned something about the Big Apple',
          'Someone was asking for directions to Times Square'
        ]
      },
      {
        _id: 'paris',
        name: 'Paris',
        country: 'France', 
        continent: 'Europe',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        landmarks: ['Eiffel Tower', 'Louvre Museum', 'Arc de Triomphe'],
        clues: [
          'I heard someone speaking French near a tall iron tower',
          'They were carrying a baguette and wearing a beret',
          'Someone mentioned visiting the Mona Lisa'
        ]
      },
      {
        _id: 'tokyo',
        name: 'Tokyo',
        country: 'Japan',
        continent: 'Asia', 
        coordinates: { lat: 35.6762, lng: 139.6503 },
        landmarks: ['Tokyo Tower', 'Shibuya Crossing', 'Mount Fuji (nearby)'],
        clues: [
          'I saw someone eating sushi with chopsticks',
          'They bowed politely before leaving',
          'Someone mentioned cherry blossoms and anime'
        ]
      },
      {
        _id: 'london',
        name: 'London',
        country: 'United Kingdom',
        continent: 'Europe',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        landmarks: ['Big Ben', 'Tower Bridge', 'Buckingham Palace'],
        clues: [
          'I heard someone with a British accent talking about tea time',
          'They mentioned the Queen and red double-decker buses',
          'Someone was carrying an umbrella despite the clear sky'
        ]
      },
      {
        _id: 'sydney',
        name: 'Sydney',
        country: 'Australia',
        continent: 'Australia/Oceania',
        coordinates: { lat: -33.8688, lng: 151.2093 },
        landmarks: ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach'],
        clues: [
          'I saw someone surfing and talking about kangaroos',
          'They said "G\'day mate" to everyone they met',
          'Someone mentioned the Opera House and throwing shrimp on the barbie'
        ]
      }
    ];
    
    await db.collection('locations').deleteMany({});
    await db.collection('locations').insertMany(locations);
    console.log(`✅ Created ${locations.length} locations`);
    
    // Create a sample case
    const cases = [
      {
        _id: 'stolen_crown_jewels',
        title: 'The Case of the Stolen Crown Jewels',
        description: 'The Crown Jewels have been stolen from the Tower of London!',
        villain_id: 'carmen_sandiego',
        correct_location: 'paris',
        difficulty: 'expert',
        status: 'active',
        created_at: new Date()
      }
    ];
    
    await db.collection('cases').deleteMany({});
    await db.collection('cases').insertMany(cases);
    console.log(`✅ Created ${cases.length} cases`);
    
    // Test queries
    const villainCount = await db.collection('villains').countDocuments();
    const locationCount = await db.collection('locations').countDocuments();
    const caseCount = await db.collection('cases').countDocuments();
    
    console.log('\n🎉 MongoDB Carmen Sandiego database ready!');
    console.log(`📊 Database contains: ${villainCount} villains, ${locationCount} locations, ${caseCount} cases`);
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupMongoDatabase();