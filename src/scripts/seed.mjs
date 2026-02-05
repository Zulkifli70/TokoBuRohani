import "dotenv/config";
import { MongoClient } from "mongodb";
import { items } from "../data/item.js";
import { productSchema } from "../lib/productSchema.js";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "Toko";
const collectionName = process.env.MONGODB_COLLECTION ?? "Katalog";

if (!uri) {
  throw new Error("Missing MONGODB_URI in .env");
}

const client = new MongoClient(uri);

function normalizeItems(rawItems) {
  return rawItems
    .map((item) => {
      const parsed = productSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter(Boolean);
}

async function seed() {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  await collection.createIndex({ name: 1 }, { unique: true });

  const normalized = normalizeItems(items);
  if (normalized.length === 0) {
    throw new Error("Tidak ada data valid untuk di-seed.");
  }

  const operations = normalized.map((item) => ({
    updateOne: {
      filter: { name: item.name },
      update: { $set: item },
      upsert: true,
    },
  }));

  const result = await collection.bulkWrite(operations, { ordered: false });
  console.log("Seed selesai:", {
    inserted: result.insertedCount,
    upserted: result.upsertedCount,
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });
}

seed()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
