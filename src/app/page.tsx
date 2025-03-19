"use client";
import { prepare } from "@/actions/prepare";
import PDFFileUpload, { FileProps } from "@/components/pdf-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PDFSource } from "@/lib/pdf-loader";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<FileProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    try {
      setLoading(true);
      setError(null);
      setLoadingMsg("Initializing Client and creating index...");

      const pdfSource: PDFSource = {
        type: "url",
        source: file?.url ?? "",
      };
      
      // Add a timeout to prevent hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 30000); // 30 second timeout
      });
      
      await Promise.race([prepare(pdfSource), timeoutPromise]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setLoadingMsg("");
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      console.error(error);
    }
  }
  
  return (
    <div>
      <div className="flex flex-1 py-16">
        <div className="w-full max-w-xs md:max-w-xl lg:max-w-2xl mx-auto dark:bg-neutral-900 dark:border-gray-400 dark:border dark:border-dotted dark:rounded-md">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {file ? (
            <>
              {loading ? (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMsg}
                </Button>
              ) : (
                <Button onClick={() => submit()} className="w-full">
                  Upload to Pinecone
                </Button>
              )}
              
              {!loading && (
                <Button 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => setFile(null)}
                >
                  Choose a different file
                </Button>
              )}
            </>
          ) : (
            <PDFFileUpload
              label=""
              file={file}
              setFile={setFile}
              endpoint="pdfUpload"
            />
          )}
        </div>
      </div>
    </div>
  );
}