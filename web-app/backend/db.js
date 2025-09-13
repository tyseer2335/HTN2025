import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-gallery';

let client = null;
let db = null;

export async function connectDB() {
  if (!client) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      client = new MongoClient(MONGODB_URI);
      await client.connect();

      // Test the connection
      await client.db('admin').command({ ping: 1 });

      db = client.db('memory-gallery');
      console.log('✅ Connected to MongoDB Atlas successfully!');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }
  return db;
}

export async function saveMemory(memoryData) {
  const database = await connectDB();
  const memories = database.collection('memories');

  const memory = {
    ...memoryData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('Saving memory to MongoDB:', memory.title || 'Untitled');
  const result = await memories.insertOne(memory);
  return { ...memory, _id: result.insertedId };
}

export async function getAllMemories(limit = 50) {
  const database = await connectDB();
  const memories = database.collection('memories');

  return await memories
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getUserMemories(userId, limit = 50) {
  const database = await connectDB();
  const memories = database.collection('memories');

  const query = userId !== 'anonymous' ? { userId } : {};

  return await memories
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getMemoryById(id) {
  const database = await connectDB();
  const memories = database.collection('memories');

  try {
    return await memories.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    // If ObjectId fails, try searching by custom id field
    return await memories.findOne({ id });
  }
}

export async function getMemoryStats() {
  const database = await connectDB();
  const memories = database.collection('memories');

  const totalMemories = await memories.countDocuments();
  const recentMemories = await memories.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  return {
    total: totalMemories,
    thisWeek: recentMemories,
    database: 'MongoDB Atlas',
    status: 'connected'
  };
}