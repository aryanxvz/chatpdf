"use client";
import { useState, useEffect } from "react";

type PineconeMetadata = {
  "loc.lines.from"?: number;
  "loc.lines.to"?: number;
  "loc.pageNumber"?: number;
  "pdf.info.IsAcroFormPresent"?: boolean;
  "pdf.info.IsXFAPresent"?: boolean;
  "pdf.info.PDFFormatVersion"?: string;
  "pdf.info.Producer"?: string;
  "pdf.info.Title"?: string;
  "pdf.totalPages"?: number;
  "pdf.version"?: string;
  text: string;
  [key: string]: unknown;
};

type PineconeRecord = {
  id: string;
  metadata: PineconeMetadata;
  score?: number;
};

export function PineconeRecords() {
  const [records, setRecords] = useState<PineconeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [apiStatus, setApiStatus] = useState<'unchecked' | 'working' | 'failing'>('unchecked');

  // Test API connection
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await fetch('/api/test');
        const data = await response.json();
        
        if (data.success) {
          setApiStatus('working');
        } else {
          setApiStatus('failing');
          setError("API test endpoint returned an error");
        }
      } catch (err) {
        console.error("Error testing API connection:", err);
        setApiStatus('failing');
        setError("API routes may not be functioning properly. Check your Next.js server.");
      }
    };

    testApiConnection();
  }, []);

  // Fetch records if API is working
  useEffect(() => {
    const fetchRecords = async () => {
      if (apiStatus !== 'working') return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/pinecone-records');
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log("Raw API response:", responseText);
        
        let data: {
          success: boolean;
          stats?: {
            dimension?: number;
            totalRecordCount?: number;
            namespaces?: Record<string, unknown>;
          };
          records?: Array<{
            id: string;
            metadata: Record<string, unknown>;
            score?: number;
          }>;
          error?: string;
        };
        
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          throw new Error(`Failed to parse response as JSON: ${responseText.substring(0, 100)}...`);
        }
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch records");
        }
        
        if (data.stats) {
          console.log("Pinecone stats:", data.stats);
        }
        
        const fetchedRecords = (data.records || []).map((match) => {
          // Ensure text is always present
          const text = typeof match.metadata.text === 'string' 
            ? match.metadata.text 
            : "";
            
          return {
            id: match.id,
            metadata: {
              ...match.metadata,
              text  // This ensures text is always present and properly typed
            },
            score: match.score
          };
        });
        
        setRecords(fetchedRecords);
      } catch (err) {
        console.error("Error fetching Pinecone records:", err);
        setError(err instanceof Error ? err.message : "Failed to load records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [apiStatus]);

  const toggleRecordExpansion = (id: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (apiStatus === 'failing') {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">API Connection Error</h3>
        <p className="mt-2 text-red-700 dark:text-red-300">
          Unable to connect to API routes. Please check that your Next.js server is running correctly.
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/40 rounded">
            <p className="text-sm font-mono break-words">{error}</p>
          </div>
        )}
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading records from Pinecone...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Fetching Records</h3>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">No Records Found</h3>
        <p className="mt-2 text-yellow-700 dark:text-yellow-300">
          There are no records in your Pinecone index. Try uploading some documents first.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Pinecone Index Records</h2>
      <p className="mb-4 text-center text-gray-600 dark:text-gray-400">
        Found {records.length} records in your Pinecone index
      </p>
      
      <div className="space-y-4">
        {records.map((record) => (
          <div 
            key={record.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-between items-center cursor-pointer"
              onClick={() => toggleRecordExpansion(record.id)}
            >
              <h3 className="font-medium">ID: {record.id}</h3>
              <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {expandedRecords.has(record.id) ? "Collapse" : "Expand"}
              </button>
            </div>
            
            {expandedRecords.has(record.id) && (
              <div className="p-4 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(record.metadata || {}).map(([key, value]) => {
                    if (key === "text") {
                      return (
                        <div key={key} className="md:col-span-2 mt-2">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Text Content:</h4>
                          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                            <p className="whitespace-pre-wrap text-sm">{value as string}</p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}:</span>
                        <span className="mt-1 text-gray-900 dark:text-gray-100">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}