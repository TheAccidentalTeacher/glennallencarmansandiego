// Simple test to verify MongoDB connection
import { testConnection } from './src/services/database-mongo-ready.js';

async function testMongoDB() {
  console.log('🔄 Testing MongoDB connection from Node.js server...');
  
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('🎉 Ready to integrate MongoDB with Carmen Sandiego game!');
    } else {
      console.log('❌ Connection test failed');
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  process.exit(0);
}

testMongoDB();