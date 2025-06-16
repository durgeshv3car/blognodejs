// s3Controller.js
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "ccapp--use1-az4--x-s3";

async function listDirectory(req, res) {
  try {
    const prefix = req.query.prefix || "";
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
    });
    const response = await s3.send(command);

    res.json({
      files: response.Contents?.map((obj) => obj.Key) || [],
      folders: response.CommonPrefixes?.map((p) => p.Prefix) || [],
    });
  } catch (err) {
    console.error("Error listing directory:", err);
    res.status(500).json({ error: "Failed to list directory" });
  }
}

async function uploadFile(req, res) {
  try {
    // Expecting "key" as query or body param, and file content in req.body or req.file.buffer
    const key = req.body.key || req.query.key;
    if (!key) return res.status(400).json({ error: "Missing 'key' parameter" });

    // If file is uploaded via multipart/form-data with multer
    // const fileBuffer = req.file.buffer;
    // For simplicity, assume raw data in req.body.fileContent as string or Buffer
    const body = req.body.fileContent;
    if (!body) return res.status(400).json({ error: "Missing file content in request body" });

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
    });

    await s3.send(command);

    res.json({ message: "File uploaded successfully", key });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
}

async function createFolder(req, res) {
  try {
    let prefix = req.body.prefix || req.query.prefix;
    if (!prefix) return res.status(400).json({ error: "Missing 'prefix' parameter" });
    if (!prefix.endsWith("/")) prefix += "/";

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: prefix,
      Body: "",
    });

    await s3.send(command);

    res.json({ message: "Folder created", prefix });
  } catch (err) {
    console.error("Error creating folder:", err);
    res.status(500).json({ error: "Failed to create folder" });
  }
}

async function deleteFolder(req, res) {
  try {
    const prefix = req.body.prefix || req.query.prefix;
    if (!prefix) return res.status(400).json({ error: "Missing 'prefix' parameter" });

    // List all objects with prefix
    const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: prefix });
    const listResponse = await s3.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return res.json({ message: "No files to delete." });
    }

    // Prepare delete objects list
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
      },
    });

    await s3.send(deleteCommand);

    res.json({ message: `Deleted all files under ${prefix}` });
  } catch (err) {
    console.error("Error deleting folder:", err);
    res.status(500).json({ error: "Failed to delete folder" });
  }
}

module.exports = {
  listDirectory,
  uploadFile,
  createFolder,
  deleteFolder,
};
