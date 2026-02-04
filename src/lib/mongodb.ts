import { MongoClient } from "mongodb";

const uri = import.meta.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI in .env");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (import.meta.env.DEV) {
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getCollection() {
  const dbName = import.meta.env.MONGODB_DB ?? "Toko";
  const collectionName = import.meta.env.MONGODB_COLLECTION ?? "Katalog";
  const db = (await clientPromise).db(dbName);
  return db.collection(collectionName);
}

export async function getProducts() {
  const collection = await getCollection();
  return collection
    .find({})
    .project({ _id: 0, name: 1, tag: 1, imgSrc: 1, imgAlt: 1 })
    .toArray();
}
