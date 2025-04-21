"use server";
import { getChunkedDocsFromPDF, PDFSource } from "@/lib/pdf-loader";
import { embedAndStoreDocs, clearPineconeIndex } from "@/lib/vector-store";
import { getPineconeClient, ensurePineconeIndex } from "@/lib/pinecone-client";

export async function prepare(source: PDFSource) {
  try {
    console.log("Getting Pinecone client...");
    const pineconeClient = await getPineconeClient();
    
    // Make sure index exists
    console.log("Ensuring index exists...");
    await ensurePineconeIndex();
    
    // Clear existing data before adding new data
    console.log("Attempting to clear existing data from Pinecone index...");
    const clearSuccess = await clearPineconeIndex(pineconeClient);
    
    if (!clearSuccess) {
      console.log("Could not clear existing data, but continuing with upload...");
    }
    
    console.log("Preparing chunks from PDF file...", source);
    const docs = await getChunkedDocsFromPDF(source);
    
    if (!docs || docs.length === 0) {
      throw new Error("No document chunks were created from the PDF");
    }
    
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    await embedAndStoreDocs(pineconeClient, docs);
    
    console.log("Data embedded and stored in pinecone index");
    return { success: true };
  } catch (error) {
    console.error("PDF processing failed:", error);
    const errorMessage = error instanceof Error 
      ? `PDF processing error: ${error.message}` 
      : "Unknown error occurred during PDF processing";
    throw new Error(errorMessage);
  }
}