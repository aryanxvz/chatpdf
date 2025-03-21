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
    const index = client.Index(env.PINECONE_INDEX_NAME);
    
    // Since you're not using namespaces explicitly in your embedAndStoreDocs function,
    // we'll delete all vectors in the index
    await index.deleteAll();
    
    console.log("Successfully cleared Pinecone index");
  } catch (error) {
    console.log("Error clearing Pinecone index:", error);
    throw new Error("Failed to clear existing data!");
  }
}