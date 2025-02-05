// utils/mongodb.js

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(client => {
      console.log('MongoDB connected (development mode)');
      return client;
    }).catch(error => {
      console.error('MongoDB connection error (development mode):', error);
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then(client => {
    console.log('MongoDB connected (production mode)');
    return client;
  }).catch(error => {
    console.error('MongoDB connection error (production mode):', error);
  });
}

export default clientPromise;
