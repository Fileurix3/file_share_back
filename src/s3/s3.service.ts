import {
  CreateBucketCommand,
  DeleteObjectCommand,
  ListBucketsCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly BUCKET_NAME = "recipes";

  constructor() {
    this.s3Client = new S3Client({
      region: "us-east-1",
      endpoint: `http://${process.env.MINIO_END_POINT}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!.toString(),
        secretAccessKey: process.env.MINIO_SECRET_KEY!.toString(),
      },
    });
  }

  async uploadFileInRecipeBucket(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split(/\./);
    const fileName = `${randomUUID()}.${fileExtension[1]}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `http://${process.env.MINIO_END_POINT}/${this.BUCKET_NAME}/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: fileName,
      }),
    );
  }

  async checkAndCreateBucket() {
    try {
      const { Buckets } = await this.s3Client.send(new ListBucketsCommand({}));
      const recipeBucketExists = Buckets?.some(
        (bucket) => bucket.Name === this.BUCKET_NAME,
      );

      if (!recipeBucketExists) {
        await this.s3Client.send(
          new CreateBucketCommand({
            Bucket: this.BUCKET_NAME,
          }),
        );

        await this.s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: this.BUCKET_NAME,
            Policy: JSON.stringify({
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Principal: "*",
                  Action: "s3:GetObject",
                  Resource: `arn:aws:s3:::${this.BUCKET_NAME}/*`,
                },
              ],
            }),
          }),
        );

        console.log(`bucket "${this.BUCKET_NAME}" was successfully created`);
      }
    } catch (err) {
      console.error("Creation Error bucket", err);
    }
  }
}
