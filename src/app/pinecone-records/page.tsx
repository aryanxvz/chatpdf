// app/pinecone-records/page.tsx
import { getPineconeClient } from "@/lib/pinecone-client";
import { env } from "@/lib/config";
import { PineconeRecordsClient } from "@/components/PineconeRecordsClient";

async function fetchPineconeRecords() {
  try {
    const client = await getPineconeClient();
    const index = client.Index(env.PINECONE_INDEX_NAME);
    
    // Get stats first
    const stats = await index.describeIndexStats();
    
    // Create a dummy vector
    const dummyVector = Array(1536).fill(0);
    
    // Query all vectors
    const queryResponse = await index.query({
      topK: 1000,
      includeMetadata: true,
      vector: dummyVector,
    });
    
    return {
      success: true,
      stats,
      records: queryResponse.matches || []
    };
  } catch (error) {
    console.error("Error fetching Pinecone records:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default async function PineconeRecordsPage() {
  const result = await fetchPineconeRecords();
  
  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center bg-white dark:bg-black">
      {/* Grid background */}
      <div className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      
      {/* Radial gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
      {/* Content Container */}
      <div className="z-10 flex w-full max-w-6xl flex-1 px-6 py-16 md:px-8 2xl:max-w-7xl">
        <div className="w-full rounded-lg bg-white p-6 shadow dark:bg-black">
          <PineconeRecordsClient initialData={result} />
        </div>
      </div>
    </div>
  );
}