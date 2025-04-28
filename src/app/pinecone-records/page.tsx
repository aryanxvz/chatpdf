// app/pinecone-records/page.tsx
import { getPineconeClient } from "@/lib/pinecone-client";
import { env } from "@/lib/config";
import { IndexStats, InitialData, PineconeRecord, PineconeRecordsClient } from "@/components/PineconeRecordsClient";

async function fetchPineconeRecords(): Promise<InitialData> {
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
    
    // Transform the Pinecone records to match our type
    // Update the records transformation in your fetchPineconeRecords function
    const records: PineconeRecord[] = (queryResponse.matches || []).map(record => ({
      id: record.id,
      metadata: {
        text: String(record.metadata?.text || ""), // Force conversion to string
        ...(record.metadata || {}) // Spread other metadata properties
      },
      score: record.score
    }));
    
    // Transform the stats to match our type
    const transformedStats: IndexStats = {
      dimension: stats.dimension,
      totalRecordCount: stats.totalRecordCount,
      namespaces: stats.namespaces ? Object.fromEntries(
        Object.entries(stats.namespaces).map(([namespace, summary]) => [
          namespace,
          { recordCount: summary.recordCount } // Using recordCount instead of vectorCount
        ])
      ) : undefined
    };
    
    return {
      success: true,
      stats: transformedStats,
      records
    };
  } catch (error) {
    console.error("Error fetching Pinecone records:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while fetching Pinecone records';
    
    return {
      success: false,
      error: errorMessage
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
      <div className="z-10 flex w-full max-w-6xl flex-1 px-6 py-8 md:px-8 2xl:max-w-7xl">
        <div className="w-full rounded-lg bg-white p-6 shadow dark:bg-black">
          <PineconeRecordsClient initialData={result} />
        </div>
      </div>
    </div>
  );
}