import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-gallery';
let client = null;
let db = null;

export async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('memory-gallery');
    console.log('Connected to MongoDB Atlas');
  }
  return db;
}

export async function saveMemory(memoryData) {
  const database = await connectToMongoDB();
  const memories = database.collection('memories');

  const memory = {
    ...memoryData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await memories.insertOne(memory);
  return { ...memory, _id: result.insertedId };
}

export async function getUserMemories(userId) {
  const database = await connectToMongoDB();
  const memories = database.collection('memories');

  return await memories
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getMemoryById(id) {
  const database = await connectToMongoDB();
  const memories = database.collection('memories');

  return await memories.findOne({ _id: new ObjectId(id) });
}

export async function updateMemory(id, updateData) {
  const database = await connectToMongoDB();
  const memories = database.collection('memories');

  const result = await memories.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    }
  );

  return result.modifiedCount > 0;
}