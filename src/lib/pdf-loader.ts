import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import axios from "axios";

export type PDFSource = {
  type: "url" | "local" | "buffer";
  source: string | Buffer;
};

export async function getChunkedDocsFromPDF(pdfSource: PDFSource) {
  let docs: Document[] = [];

  try {
    console.log("Processing PDF with source type:", pdfSource.type);
    
    switch (pdfSource.type) {
      case "url": {
        console.log("Downloading PDF from URL:", pdfSource.source);
        // Download PDF from URL
        const response = await axios.get(pdfSource.source as string, {
          responseType: "arraybuffer",
          timeout: 30000, // 30 second timeout
        });
        console.log("PDF downloaded, size:", response.data.byteLength);
        
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const loader = new WebPDFLoader(pdfBlob);
        docs = await loader.load();
        console.log("PDF loaded successfully");
        break;
      }

      case "local": {
        // Handle local file system PDF using PDFLoader
        const loader = new PDFLoader(pdfSource.source as string);
        docs = await loader.load();
        break;
      }
      case "buffer": {
        // Handle Buffer (e.g., from fs.readFile)
        const pdfBlob = new Blob([pdfSource.source as Buffer], {
          type: "application/pdf",
        });
        const loader = new WebPDFLoader(pdfBlob);
        docs = await loader.load();
        break;
      }
      default:
        throw new Error("Unsupported PDF source type");
    }

    // Split into chunks
    console.log("Splitting documents into chunks...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);
    console.log(`Created ${chunkedDocs.length} chunks`);
    return chunkedDocs;
  } catch (e) {
    console.error("PDF processing error:", e);
    throw new Error(`PDF docs chunking failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}