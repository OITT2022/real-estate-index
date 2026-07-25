import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/lib/db";
import { getS3PublicUrl } from "@/lib/storage";

/**
 * POST /api/upload/presign
 * Returns a presigned S3 URL for direct client-side upload.
 * Used for large files (HDR/EXR) that exceed the server's regular request body-size limit.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fileName, projectId } = body as {
    fileName?: string;
    projectId?: string;
  };

  if (!fileName || !projectId) {
    return NextResponse.json({ error: "fileName and projectId required" }, { status: 400 });
  }

  const ext = fileName.toLowerCase().split(".").pop();
  if (ext !== "exr" && ext !== "hdr") {
    return NextResponse.json({ error: "Only .exr and .hdr files are allowed" }, { status: 400 });
  }

  const bucket = process.env.S3_BUCKET ?? "aradre-assets";
  const region = process.env.S3_REGION ?? "eu-north-1";
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  // For local dev without S3, fall back to regular upload
  if (!accessKeyId || !secretAccessKey) {
    return NextResponse.json({ error: "S3 not configured, use regular upload" }, { status: 400 });
  }

  const endpoint = process.env.S3_ENDPOINT;
  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    ...(endpoint ? { endpoint, forcePathStyle: false } : {}),
  });

  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // No ACL here: it would become a signed header the client's PUT must also send exactly,
  // and the client currently only sends Content-Type. Set ACL after upload if this needs to be public.
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: "application/octet-stream",
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const finalUrl = getS3PublicUrl(bucket, region, key);

  // Save the URL to the project now — the client will upload directly to S3
  await db.project.update({
    where: { id: projectId },
    data: { environmentExrUrl: finalUrl },
  });

  return NextResponse.json({ presignedUrl, finalUrl, fileName });
}
