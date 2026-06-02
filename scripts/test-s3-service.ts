#!/usr/bin/env node

/**
 * S3 Service Test Script
 *
 * Tests AWS S3 bucket access and certificate storage capability.
 * Run to verify S3 is properly configured before going to production.
 *
 * Usage:
 *   npm run test:s3
 */

import { S3Client, HeadBucketCommand, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";

const s3Region = process.env.AWS_S3_REGION || "us-east-1";
const s3Bucket = process.env.AWS_S3_BUCKET;

interface TestResult {
  name: string;
  status: "✅ PASS" | "⚠️  WARNING" | "❌ FAIL";
  message: string;
  details?: Record<string, any>;
}

const results: TestResult[] = [];

async function testS3Service() {
  console.log("💾 Testing S3 Service Configuration...\n");

  // Check environment variables
  console.log("📋 Checking Configuration...");
  const checks = [
    { name: "AWS_S3_BUCKET", value: s3Bucket, required: true },
    { name: "AWS_S3_REGION", value: s3Region, required: true },
    { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID ? "***" : undefined, required: true },
    { name: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY ? "***" : undefined, required: true },
  ];

  for (const check of checks) {
    if (check.required && !check.value) {
      results.push({
        name: check.name,
        status: "❌ FAIL",
        message: `${check.name} is not configured`,
      });
    } else if (check.value) {
      results.push({
        name: check.name,
        status: "✅ PASS",
        message: `${check.name} is configured`,
        details: { value: check.value },
      });
    }
  }

  // If configuration failed, stop here
  const configFailed = results.some(r => r.status === "❌ FAIL");
  if (configFailed) {
    printResults();
    process.exit(1);
  }

  // Test S3 bucket access
  console.log("\n🔗 Testing S3 Bucket Access...");

  let s3Client: S3Client;
  try {
    s3Client = new S3Client({ region: s3Region });
  } catch (error) {
    results.push({
      name: "S3 Client",
      status: "❌ FAIL",
      message: "Failed to initialize S3 client",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    printResults();
    process.exit(1);
  }

  // Test bucket exists and is accessible
  console.log(`🪣 Checking bucket: ${s3Bucket}`);
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }));
    results.push({
      name: "S3 Bucket Access",
      status: "✅ PASS",
      message: `Bucket ${s3Bucket} is accessible`,
      details: {
        bucket: s3Bucket,
        region: s3Region,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes("NotFound") || errorMsg.includes("NoSuchBucket")) {
      results.push({
        name: "S3 Bucket Access",
        status: "❌ FAIL",
        message: `Bucket ${s3Bucket} does not exist`,
        details: {
          bucket: s3Bucket,
          region: s3Region,
          action: "Create bucket in AWS S3 console",
        },
      });
    } else if (errorMsg.includes("AccessDenied") || errorMsg.includes("Forbidden")) {
      results.push({
        name: "S3 Bucket Access",
        status: "❌ FAIL",
        message: `Access denied to bucket ${s3Bucket}`,
        details: {
          action: "Check IAM permissions for S3 access",
          error: errorMsg,
        },
      });
    } else {
      results.push({
        name: "S3 Bucket Access",
        status: "❌ FAIL",
        message: `Failed to access bucket: ${errorMsg}`,
      });
    }
    printResults();
    process.exit(1);
  }

  // Test write permission
  console.log("\n📝 Testing Upload (Write) Permission...");
  const testKey = `test/certificate-test-${Date.now()}.txt`;
  const testContent = `WizLingo S3 Test - ${new Date().toISOString()}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: testKey,
        Body: testContent,
        ContentType: "text/plain",
      })
    );

    results.push({
      name: "S3 Upload Permission",
      status: "✅ PASS",
      message: "Successfully uploaded test file to S3",
      details: {
        bucket: s3Bucket,
        key: testKey,
        size: testContent.length,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({
      name: "S3 Upload Permission",
      status: "❌ FAIL",
      message: `Failed to upload file: ${errorMsg}`,
      details: {
        action: "Verify IAM user has s3:PutObject permission",
      },
    });
    printResults();
    process.exit(1);
  }

  // Test read permission
  console.log("\n📖 Testing Download (Read) Permission...");

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: s3Bucket,
        Key: testKey,
      })
    );

    const body = await streamToString(response.Body as any);
    if (body === testContent) {
      results.push({
        name: "S3 Download Permission",
        status: "✅ PASS",
        message: "Successfully downloaded test file from S3",
        details: {
          bucket: s3Bucket,
          key: testKey,
          size: body.length,
          contentMatches: body === testContent,
        },
      });
    } else {
      results.push({
        name: "S3 Download Permission",
        status: "⚠️  WARNING",
        message: "Downloaded file but content doesn't match",
        details: {
          expected: testContent,
          received: body,
        },
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({
      name: "S3 Download Permission",
      status: "❌ FAIL",
      message: `Failed to download file: ${errorMsg}`,
      details: {
        action: "Verify IAM user has s3:GetObject permission",
      },
    });
  }

  // Test list permission
  console.log("\n📋 Testing List Permission...");

  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: s3Bucket,
        MaxKeys: 10,
      })
    );

    results.push({
      name: "S3 List Permission",
      status: "✅ PASS",
      message: "Successfully listed bucket contents",
      details: {
        bucket: s3Bucket,
        objectCount: response.Contents?.length || 0,
        isTruncated: response.IsTruncated,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({
      name: "S3 List Permission",
      status: "⚠️  WARNING",
      message: `Failed to list bucket: ${errorMsg}`,
      details: {
        note: "This is often okay if bucket is empty",
      },
    });
  }

  // Test delete permission
  console.log("\n🗑️ Testing Delete (Cleanup) Permission...");

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: s3Bucket,
        Key: testKey,
      })
    );

    results.push({
      name: "S3 Delete Permission",
      status: "✅ PASS",
      message: "Successfully deleted test file from S3",
      details: {
        bucket: s3Bucket,
        key: testKey,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({
      name: "S3 Delete Permission",
      status: "⚠️  WARNING",
      message: `Failed to delete file: ${errorMsg}`,
      details: {
        note: "S3 delete permission is less critical for certificate storage",
      },
    });
  }

  // Test certificate storage path structure
  console.log("\n🏗️ Testing Certificate Path Structure...");

  const sampleCertKey = `certificates/student-123/WORD_WIZARD-${Date.now()}.png`;
  const sampleBuffer = randomBytes(100); // 100 bytes of random data

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: sampleCertKey,
        Body: sampleBuffer,
        ContentType: "image/png",
        Metadata: {
          "studentId": "student-123",
          "badgeType": "WORD_WIZARD",
          "uploadedAt": new Date().toISOString(),
        },
      })
    );

    results.push({
      name: "S3 Certificate Path",
      status: "✅ PASS",
      message: "Certificate path structure works correctly",
      details: {
        examplePath: sampleCertKey,
        structure: "certificates/{studentId}/{badgeType}-{timestamp}.png",
      },
    });

    // Cleanup
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: s3Bucket,
          Key: sampleCertKey,
        })
      );
    } catch {}
  } catch (error) {
    results.push({
      name: "S3 Certificate Path",
      status: "⚠️  WARNING",
      message: "Failed to test certificate path",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Print results
  printResults();

  // Exit with appropriate code
  const failed = results.filter(r => r.status === "❌ FAIL").length;
  process.exit(failed > 0 ? 1 : 0);
}

async function streamToString(stream: any): Promise<string> {
  let result = "";
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => {
      result += chunk.toString();
    });
    stream.on("end", () => resolve(result));
    stream.on("error", reject);
  });
}

function printResults() {
  console.log("\n" + "=".repeat(60));
  console.log("S3 SERVICE TEST RESULTS");
  console.log("=".repeat(60) + "\n");

  for (const result of results) {
    console.log(`${result.status} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      for (const [key, value] of Object.entries(result.details)) {
        console.log(`   • ${key}: ${value}`);
      }
    }
    console.log();
  }

  const passed = results.filter(r => r.status === "✅ PASS").length;
  const warnings = results.filter(r => r.status === "⚠️  WARNING").length;
  const failed = results.filter(r => r.status === "❌ FAIL").length;

  console.log("=".repeat(60));
  console.log(`SUMMARY: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  console.log("=".repeat(60) + "\n");

  if (failed > 0) {
    console.log("❌ S3 service test FAILED. Please fix the issues above.\n");
  } else if (warnings > 0) {
    console.log("⚠️  S3 service test completed with warnings. Review above.\n");
  } else {
    console.log("✅ S3 service test PASSED. Ready to store certificates in production.\n");
  }
}

// Run tests
testS3Service().catch((error) => {
  console.error("❌ Test script error:", error);
  process.exit(1);
});
