import { env } from "./config";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";

export async function embedAndStoreDocs(
  client: PineconeClient,
  docs: Document[]
) {
  /*create and store the embeddings in the vectorStore*/
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.Index(env.PINECONE_INDEX_NAME);

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load your docs !");
  }
}

// Returns vector-store handle to be used a retrievers on langchains
export async function getVectorStore(client: PineconeClient) {
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.Index(env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    return vectorStore;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}

export async function clearPineconeIndex(client: PineconeClient) {
  try {
    console.log("Getting index for clearing:", env.PINECONE_INDEX_NAME);
    const index = client.Index(env.PINECONE_INDEX_NAME);
    
    // Check if index exists first
    try {
      const indexStats = await index.describeIndexStats();
      console.log("Index stats before clearing:", indexStats);
      
      // Fix: Handle possible undefined value and provide default of 0
      const recordCount = indexStats.totalRecordCount ?? 0;
      
      if (recordCount > 0) {
        console.log("Clearing all vectors from index...");
        await index.deleteAll();
        console.log("Successfully cleared Pinecone index");
      } else {
        console.log("Index is already empty, no need to clear");
      }
      return true;
    } catch (statsError) {
      console.log("Could not get index stats, proceeding without clearing:", statsError);
      return false;
    }
  } catch (error) {
    console.log("Error clearing Pinecone index:", error);
    return false; // Return false instead of throwing
  }
}