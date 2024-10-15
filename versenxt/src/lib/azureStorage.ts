import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'versetta1';

if (!connectionString) {
  throw new Error("Azure Storage connection string is missing");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
export const containerClient = blobServiceClient.getContainerClient(containerName);

// Create the container if it doesn't exist
async function createContainerIfNotExists() {
  try {
    await containerClient.createIfNotExists();
    console.log(`Container "${containerName}" created or already exists.`);
  } catch (error) {
    console.error(`Error creating container "${containerName}":`, error);
  }
}

createContainerIfNotExists();