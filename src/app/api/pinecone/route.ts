// app/api/pinecone-records/route.ts
import { NextResponse } from "next/server";
import { getPineconeClient } from "@/lib/pinecone-client";
import { env } from "@/lib/config";

export async function GET() {
  try {
    // First, test if we can get the client
    const client = await getPineconeClient();
    
    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to initialize Pinecone client" 
      }, { status: 500 });
    }
    
    try {
      // Get the index
      const index = client.Index(env.PINECONE_INDEX_NAME);
      
      // Try to get stats first to confirm connection works
      const stats = await index.describeIndexStats();
      
      // Create a dummy vector of the correct dimension (1536)
      const dummyVector = Array(1536).fill(0);
      
      // Query with a dummy vector to fetch records
      const queryResponse = await index.query({
        topK: 1000, // Adjust based on your needs
        includeMetadata: true,
        vector: dummyVector,
      });
      
      return NextResponse.json({ 
        success: true, 
        stats: stats,
        records: queryResponse.matches || [] 
      });
    } catch (indexError) {
      console.error("Error accessing Pinecone index:", indexError);
      return NextResponse.json({ 
        success: false, 
        error: `Error accessing Pinecone index: ${indexError.message}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in Pinecone records API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to fetch records: ${error.message}` 
      },
      { status: 500 }
    );
  }
}