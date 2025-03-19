"use server";
import { getChunkedDocsFromPDF, PDFSource } from "@/lib/pdf-loader";
import { embedAndStoreDocs, clearPineconeIndex } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";

export async function prepare(source: PDFSource) {
  try {
    console.log("Getting Pinecone client...");
    const pineconeClient = await getPineconeClient();
    
    // Clear existing data before adding new data
    console.log("Clearing existing data from Pinecone index...");
    await clearPineconeIndex(pineconeClient);
    
    console.log("Preparing chunks from PDF file...");
    const docs = await getChunkedDocsFromPDF(source);
    
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    await embedAndStoreDocs(pineconeClient, docs);
    
    console.log("Data embedded and stored in pinecone index");
    return { success: true };
  } catch (error) {
    console.error("PDF processing failed:", error);
    throw error; // Re-throw to propagate to the client
  }
}