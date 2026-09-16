import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { config } from "../config";
import { sanitizeFilename } from "../utils/fileValidation";

export interface S3UploadResult {
  fileKey: string;
  fileSize: number;
  mimeType: string;
  fileName: string;
}

export class StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private region: string;
  private isMockMode: boolean;
  // In-memory / local cache for test environment without AWS credentials
  private mockStorage: Map<string, { buffer: Buffer; mimeType: string }> = new Map();

  constructor() {
    this.bucketName = config.s3.bucketName;
    this.region = config.s3.region;

    // Check if we have AWS credentials or IAM role available, or if mock mode is forced
    const hasExplicitKeys = Boolean(config.s3.accessKeyId && config.s3.secretAccessKey);
    const forceMock = config.env === "test" || process.env.MOCK_S3 === "true";

    this.isMockMode = forceMock && !hasExplicitKeys;

    if (!this.isMockMode) {
      try {
        const clientConfig: any = { region: this.region };
        if (hasExplicitKeys) {
          clientConfig.credentials = {
            accessKeyId: config.s3.accessKeyId!,
            secretAccessKey: config.s3.secretAccessKey!,
          };
        }
        // In EC2 production, AWS SDK default credential provider chain automatically uses IAM roles.
        this.s3Client = new S3Client(clientConfig);
      } catch (err) {
        console.warn("[StorageService] Could not initialize AWS S3 client, falling back to mock mode:", err);
        this.isMockMode = true;
      }
    }
  }

  /**
   * Generates a secure, non-public S3 key structure:
   * applications/{applicationId}/{uuid}-{safeFileName}
   */
  public generateFileKey(applicationId: string, originalFileName: string): string {
    const safeName = sanitizeFilename(originalFileName);
    const uniqueId = crypto.randomUUID();
    return `applications/${applicationId}/${uniqueId}-${safeName}`;
  }

  /**
   * Generates a secure S3 key structure for blog post images:
   * blog/{postId}/{uuid}-{safeFileName}
   */
  public generateBlogImageKey(postId: string, originalFileName: string): string {
    const safeName = sanitizeFilename(originalFileName);
    const uniqueId = crypto.randomUUID();
    return `blog/${postId}/${uniqueId}-${safeName}`;
  }

  /**
   * Uploads blog featured image buffer to private S3 bucket.
   */
  public async uploadBlogImage(
    postId: string,
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string
  ): Promise<S3UploadResult> {
    const fileKey = this.generateBlogImageKey(postId, originalFileName);
    const safeFileName = sanitizeFilename(originalFileName);

    if (this.isMockMode || !this.s3Client) {
      this.mockStorage.set(fileKey, { buffer: fileBuffer, mimeType });
      return {
        fileKey,
        fileSize: fileBuffer.length,
        mimeType,
        fileName: safeFileName,
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: mimeType,
        ServerSideEncryption: "AES256",
      });

      await this.s3Client.send(command);

      return {
        fileKey,
        fileSize: fileBuffer.length,
        mimeType,
        fileName: safeFileName,
      };
    } catch (err: any) {
      if (config.env !== "production") {
        console.warn(`[StorageService] S3 blog image upload failed (${err.message}). Recording locally for dev/test.`);
        this.mockStorage.set(fileKey, { buffer: fileBuffer, mimeType });
        return {
          fileKey,
          fileSize: fileBuffer.length,
          mimeType,
          fileName: safeFileName,
        };
      }
      throw new Error(`Failed to upload blog image to S3: ${err.message}`);
    }
  }

  /**
   * Uploads resume buffer to private S3 bucket.
   * Bucket remains private: no public-read ACL is set.
   */
  public async uploadResume(
    applicationId: string,
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string
  ): Promise<S3UploadResult> {
    const fileKey = this.generateFileKey(applicationId, originalFileName);
    const safeFileName = sanitizeFilename(originalFileName);

    if (this.isMockMode || !this.s3Client) {
      this.mockStorage.set(fileKey, { buffer: fileBuffer, mimeType });
      return {
        fileKey,
        fileSize: fileBuffer.length,
        mimeType,
        fileName: safeFileName,
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: mimeType,
        // Enforce private storage and server-side encryption
        ServerSideEncryption: "AES256",
      });

      await this.s3Client.send(command);

      return {
        fileKey,
        fileSize: fileBuffer.length,
        mimeType,
        fileName: safeFileName,
      };
    } catch (err: any) {
      // In development or test, if S3 call fails due to invalid credentials, fall back gracefully
      if (config.env !== "production") {
        console.warn(`[StorageService] S3 upload failed (${err.message}). Recording locally for dev/test.`);
        this.mockStorage.set(fileKey, { buffer: fileBuffer, mimeType });
        return {
          fileKey,
          fileSize: fileBuffer.length,
          mimeType,
          fileName: safeFileName,
        };
      }
      throw new Error(`Failed to upload resume to S3: ${err.message}`);
    }
  }

  /**
   * Generates a short-lived presigned download URL for recruiter/admin document access.
   * Default expiration is 15 minutes (900 seconds).
   */
  public async getPresignedDownloadUrl(
    fileKey: string,
    expiresInSeconds: number = config.s3.presignedExpiresInSeconds
  ): Promise<string> {
    if (this.isMockMode || !this.s3Client) {
      const token = crypto.randomBytes(16).toString("hex");
      const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Signature=${token}&expires=${expiresAt}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds,
      });

      return presignedUrl;
    } catch (err: any) {
      if (config.env !== "production") {
        const token = crypto.randomBytes(16).toString("hex");
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Signature=${token}`;
      }
      throw new Error(`Failed to generate presigned S3 URL: ${err.message}`);
    }
  }

  /**
   * Deletes a file from S3. Used during compensation rollback or application deletion.
   */
  public async deleteFile(fileKey: string): Promise<void> {
    if (this.isMockMode || !this.s3Client) {
      this.mockStorage.delete(fileKey);
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      await this.s3Client.send(command);
    } catch (err: any) {
      console.warn(`[StorageService] Failed to delete S3 file ${fileKey}:`, err.message);
      this.mockStorage.delete(fileKey);
    }
  }

  /**
   * For testing: check if file exists in mock storage or can be retrieved
   */
  public hasFileInMock(fileKey: string): boolean {
    return this.mockStorage.has(fileKey);
  }

  /**
   * Retrieves file buffer and mime-type if available (mock storage or S3 stream).
   */
  public async getFile(fileKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (this.isMockMode || !this.s3Client || this.mockStorage.has(fileKey)) {
      const entry = this.mockStorage.get(fileKey);
      if (entry) return entry;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      const response = await this.s3Client.send(command);
      if (!response.Body) return null;
      const byteArray = await response.Body.transformToByteArray();
      return {
        buffer: Buffer.from(byteArray),
        mimeType: response.ContentType || "application/octet-stream",
      };
    } catch (err: any) {
      const entry = this.mockStorage.get(fileKey);
      if (entry) return entry;
      return null;
    }
  }

  public getBucketName(): string {
    return this.bucketName;
  }

  public getRegion(): string {
    return this.region;
  }
}

export const storageService = new StorageService();
export default storageService;
