import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./config";

// Create a singleton instance
let pineconeClientInstance: Pinecone | null = null;

// Initialize client only, don't try to create index every time
async function initPineconeClient() {
  try {
    if (pineconeClientInstance) return pineconeClientInstance;
    
    console.log("Initializing Pinecone client...");
    const pineconeClient = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
    });
    
    // Store the singleton instance
    pineconeClientInstance = pineconeClient;
    return pineconeClient;
  } catch (error) {
    console.error("Error initializing Pinecone client:", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

// Separate function to ensure index exists (call this once during setup)
export async function ensurePineconeIndex() {
  const client = await initPineconeClient();
  try {
    // Check if index exists first
    const indexes = await client.listIndexes();
    // Fix: Convert IndexList to array and check if index name exists
    const indexExists = indexes.indexes?.some((idx: { name: string }) => idx.name === env.PINECONE_INDEX_NAME) || false;
    
    if (!indexExists) {
      console.log(`Creating index: ${env.PINECONE_INDEX_NAME}`);
      await client.createIndex({
        name: env.PINECONE_INDEX_NAME,
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
        waitUntilReady: true,
      });
      console.log("Index created successfully");
    } else {
      console.log(`Index ${env.PINECONE_INDEX_NAME} already exists`);
    }
    return true;
  } catch (error) {
    console.error("Error ensuring index exists:", error);
    return false;
  }
}

export async function getPineconeClient() {
  return await initPineconeClient();
}