// MongoDB database service for Carmen Sandiego game
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const client = MONGODB_URI ? new MongoClient(MONGODB_URI) : null;
let db: Db | null = null;

// Connect to MongoDB
export const connectMongo = async (): Promise<Db> => {
  try {
    if (!client) {
      throw new Error('MongoDB client not initialized - check MONGODB_URI in environment');
    }
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
export const testConnection = async (): Promise<boolean> => {
  try {
    const database = await connectMongo();
    await database.admin().ping();
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB connection test failed:', error?.message || error);
    return false;
  }
};

// Game data queries
export const getVillains = async () => {
  const database = await connectMongo();
  return await database.collection('villains').find({}).toArray();
};

export const getVillainById = async (id: string) => {
  const database = await connectMongo();
  return await database.collection('villains').findOne({ _id: id });
};

export const getLocations = async () => {
  const database = await connectMongo();
  return await database.collection('locations').find({}).toArray();
};

export const getLocationById = async (id: string) => {
  const database = await connectMongo();
  return await database.collection('locations').findOne({ _id: id });
};

export const getCases = async () => {
  const database = await connectMongo();
  return await database.collection('cases').find({}).toArray();
};

export const getCaseById = async (id: string) => {
  const database = await connectMongo();
  return await database.collection('cases').findOne({ _id: id });
};

// Game session management
export const createGameSession = async (sessionData: any) => {
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

export const updateGameSession = async (sessionId: string, updateData: any) => {
  const database = await connectMongo();
  const result = await database.collection('game_sessions').updateOne(
    { _id: sessionId },
    { $set: { ...updateData, updated_at: new Date() } }
  );
  return result.modifiedCount > 0;
};

export const getGameSession = async (sessionId: string) => {
  const database = await connectMongo();
  return await database.collection('game_sessions').findOne({ _id: sessionId });
};

// User progress tracking
export const saveUserProgress = async (userId: string, progressData: any) => {
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

export const getUserProgress = async (userId: string) => {
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