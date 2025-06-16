const { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "ccapp--use1-az4--x-s3";

// List objects in a "folder"
async function listDirectory(prefix) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
    Delimiter: "/"
  });

  const response = await s3.send(command);
  console.log("Files:", response.Contents?.map(obj => obj.Key));
  console.log("Folders:", response.CommonPrefixes?.map(p => p.Prefix));
}

// Upload a file to a "folder"
async function uploadFile(key, body) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key, // e.g., "folder1/file.txt"
    Body: body
  });

  await s3.send(command);
 
}

// Create an empty "folder"
async function createFolder(prefix) {
  if (!prefix.endsWith("/")) prefix += "/";
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: prefix,
    Body: ""
  });

  await s3.send(command);
 
}

// Delete a "folder" (all contents under prefix)
async function deleteFolder(prefix) {
  const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: prefix });
  const listResponse = await s3.send(listCommand);

  if (!listResponse.Contents || listResponse.Contents.length === 0) {
    console.log("No files to delete.");
    return;
  }

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: listResponse.Contents.map(obj => ({ Key: obj.Key }))
    }
  });

  await s3.send(deleteCommand);

}

// Example usage
(async () => {
  await createFolder("example-folder/");
  await uploadFile("example-folder/hello.txt", "Hello from Node.js!");
  await listDirectory("example-folder/");
  await deleteFolder("example-folder/");
})();