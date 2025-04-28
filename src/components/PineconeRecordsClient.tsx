// components/PineconeRecordsClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

type PineconeRecord = {
  id: string;
  metadata: {
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
    [key: string]: any;
  };
  score?: number;
};

type InitialData = {
  success: boolean;
  stats?: any;
  records?: PineconeRecord[];
  error?: string;
};

export function PineconeRecordsClient({ initialData }: { initialData: InitialData }) {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

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

  if (!initialData.success) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
        <p className="mt-2 text-red-700 dark:text-red-300">{initialData.error || "Failed to fetch Pinecone records"}</p>
        <Link 
          href="/chat"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Chat
        </Link>
      </div>
    );
  }

  const records = initialData.records || [];

  if (records.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">No Records Found</h3>
        <p className="mt-2 text-yellow-700 dark:text-yellow-300">
          There are no records in your Pinecone index. Try uploading some documents first.
        </p>
        <Link 
          href="/chat"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Chat
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pinecone Index Records</h2>
        <Link 
          href="/chat"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Chat
        </Link>
      </div>
      
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Found {records.length} records in your Pinecone index
      </p>
      
      {initialData.stats && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-200">Index Stats:</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-blue-500 dark:text-blue-400">Dimension:</span>
              <span className="ml-2">{initialData.stats.dimension || "N/A"}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-blue-500 dark:text-blue-400">Total Records:</span>
              <span className="ml-2">{initialData.stats.totalRecordCount || 0}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-blue-500 dark:text-blue-400">Namespaces:</span>
              <span className="ml-2">{initialData.stats.namespaces ? Object.keys(initialData.stats.namespaces).length : 0}</span>
            </div>
          </div>
        </div>
      )}
      
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
                    // Special handling for text field
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