"use client";
import { prepare } from "@/actions/prepare";
import PDFFileUpload, { FileProps } from "@/components/pdf-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PDFSource } from "@/lib/pdf-loader";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Page() {
  const [file, setFile] = useState<FileProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    try {
      setLoading(true);
      setError(null);
      setLoadingMsg("Initializing Client and creating index...");

      // Make sure we have a valid URL
      if (!file?.url) {
        throw new Error("Invalid file URL. Please try uploading again.");
      }

      const pdfSource: PDFSource = {
        type: "url",
        source: file.url,
      };
      
      console.log("Submitting PDF source:", pdfSource);
      
      // Add a timeout to prevent hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000);
      });
      
      // Add progress indicators
      const progressIndicator = setInterval(() => {
        setLoadingMsg(prev => {
          if (prev.endsWith("...")) return "Processing PDF";
          return prev + ".";
        });
      }, 1000);
      
      try {
        await Promise.race([prepare(pdfSource), timeoutPromise]);
        clearInterval(progressIndicator);
        setLoading(false);
        
        // Navigate to the chat page after successful upload
        router.push("/chat");
      } catch (err) {
        clearInterval(progressIndicator);
        throw err;
      }
    } catch (error) {
      setLoading(false);
      setLoadingMsg("");
      
      // Enhanced error reporting
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error details:", error);
      setError(`Upload failed: ${errorMessage}`);
    }
  }
  
  return (
    <div className="relative flex min-h-[54rem] w-full items-center justify-center bg-white dark:bg-black">
      {/* Grid background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
      {/* Title */}
      <p className="absolute top-12 left-0 right-0 text-center z-20 bg-gradient-to-b from-neutral-400 to-neutral-900 dark:bg-gradient-to-b dark:from-neutral-400 dark:to-neutral-50 bg-clip-text py-8 text-6xl font-bold text-transparent sm:text-7xl">
        chatpdf
      </p>
      <p className="absolute top-40 pt-3 left-0 right-0 text-center z-20 bg-gradient-to-b from-neutral-400 to-neutral-900 dark:bg-gradient-to-b dark:from-neutral-400 dark:to-neutral-50 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
        decoding documents effortlessly
      </p>
      <p className="absolute top-56 md:pt-0 pt-10 left-0 right-0 text-center z-20 bg-gradient-to-b from-neutral-400 to-neutral-900 dark:bg-gradient-to-b dark:from-neutral-400 dark:to-neutral-50 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
        Upload - Ask - Discover
      </p>
      
      {/* Content */}
      <div className="flex flex-1 py-8 md:py-0 z-10 relative -top-4 lg:-top-10 cursor-pointer">
        <div className="w-full max-w-xs md:max-w-xl lg:max-w-2xl mx-auto dark:bg-neutral-900/80 dark:border-gray-400 dark:border dark:border-dotted dark:rounded-md bg-white/80 border border-gray-200 border-dotted rounded-md shadow-lg backdrop-blur-sm p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {file ? (
            <div className="space-y-4">
              <div className="p-2 border rounded-md">
                <p className="font-medium">Selected file:</p>
                <p className="text-sm truncate">{file.title}</p> {/* Use title instead of name */}
              </div>
              
              {loading ? (
                <div className="w-full text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                  <p>{loadingMsg}</p>
                </div>
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
            </div>
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
      <p className="absolute bottom-[300px] left-0 right-0 text-center z-20 bg-gradient-to-b from-neutral-400 to-neutral-900 dark:bg-gradient-to-b dark:from-neutral-400 dark:to-neutral-50 bg-clip-text text-base font-bold text-transparent sm:text-lg">
        Upload your PDF to get started
      </p>
      <p className="absolute bottom-[270px] left-0 right-0 text-center z-20 bg-gradient-to-b from-neutral-400 to-neutral-900 dark:bg-gradient-to-b dark:from-neutral-400 dark:to-neutral-50 bg-clip-text text-sm font-bold text-transparent sm:text-base">
        Size limit - 16MB
      </p>
    </div>
  );
}