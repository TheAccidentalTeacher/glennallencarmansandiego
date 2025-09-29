// Simple MongoDB connection test
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

async function testConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    return;
  }

  console.log('🔄 Testing MongoDB Atlas connection from server...');
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('carmen-sandiego');
    const villains = await db.collection('villains').find({}).toArray();
    
    console.log('✅ MongoDB connection successful!');
    console.log(`📊 Found ${villains.length} villains in database`);
    console.log('🎮 Villains:', villains.map(v => v.name));
    
    await client.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();