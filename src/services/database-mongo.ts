// MongoDB database service for Carmen Sandiego game
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carmen-sandiego';
const client = new MongoClient(MONGODB_URI);
let db: Db | null = null;

// Connect to MongoDB
export const connectMongo = async () => {
  try {
    if (!db) {
      await client.connect();
      db = client.db('carmen-sandiego');
      console.log('✅ MongoDB connected successfully');
    }
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Test connection
export const testConnection = async () => {
  try {
    const database = await connectMongo();
    await database.admin().ping();
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return false;
  }
};

// Game data queries
export const getVillains = async () => {
  const database = await connectMongo();
  return await database.collection('villains').find({}).toArray();
};

export const getVillainById = async (id: string): Promise<any> => {
  const database = await connectMongo();
  return await database.collection('villains').findOne({ _id: id } as any);
};

export const getLocations = async (): Promise<any[]> => {
  const database = await connectMongo();
  return await database.collection('locations').find({}).toArray();
};

export const getLocationById = async (id: string): Promise<any> => {
  const database = await connectMongo();
  return await database.collection('locations').findOne({ _id: id } as any);
};

export const getCases = async (): Promise<any[]> => {
  const database = await connectMongo();
  return await database.collection('cases').find({}).toArray();
};

export const getCaseById = async (id: string): Promise<any> => {
  const database = await connectMongo();
  return await database.collection('cases').findOne({ _id: id });
};

// Game session management
export const createGameSession = async (sessionData) => {
  const database = await connectMongo();
  const session = {
    _id: sessionData.sessionId || new Date().getTime().toString(),
    ...sessionData,
    created_at: new Date(),
    updated_at: new Date()
  };
  await database.collection('game_sessions').insertOne(session);
  return session;
};

export const updateGameSession = async (sessionId, updateData) => {
  const database = await connectMongo();
  const result = await database.collection('game_sessions').updateOne(
    { _id: sessionId },
    { $set: { ...updateData, updated_at: new Date() } }
  );
  return result.modifiedCount > 0;
};

export const getGameSession = async (sessionId) => {
  const database = await connectMongo();
  return await database.collection('game_sessions').findOne({ _id: sessionId });
};

// Warrant system
export const createWarrant = async (warrantData) => {
  const database = await connectMongo();
  const warrant = {
    _id: new Date().getTime().toString(),
    ...warrantData,
    issued_at: new Date()
  };
  await database.collection('warrants').insertOne(warrant);
  return warrant;
};

export const getActiveWarrants = async () => {
  const database = await connectMongo();
  return await database.collection('warrants').find({ status: 'active' }).toArray();
};

// User progress tracking
export const saveUserProgress = async (userId, progressData) => {
  const database = await connectMongo();
  const result = await database.collection('user_progress').updateOne(
    { user_id: userId },
    { 
      $set: { 
        ...progressData, 
        updated_at: new Date() 
      },
      $setOnInsert: { created_at: new Date() }
    },
    { upsert: true }
  );
  return result;
};

export const getUserProgress = async (userId) => {
  const database = await connectMongo();
  return await database.collection('user_progress').findOne({ user_id: userId });
};

// Close connection
export const closeConnection = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

// Handle process termination
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);