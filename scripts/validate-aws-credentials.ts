#!/usr/bin/env node

/**
 * AWS Credentials Validation Script
 *
 * Validates that AWS credentials are configured correctly and have proper permissions.
 * Run before deploying to production.
 *
 * Usage:
 *   npm run validate:aws
 */

import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { SESClient, VerifyEmailIdentityCommand, ListVerifiedEmailAddressesCommand } from "@aws-sdk/client-ses";
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const AWS_SES_REGION = process.env.AWS_SES_REGION || "us-east-1";
const AWS_S3_REGION = process.env.AWS_S3_REGION || "us-east-1";
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "noreply@wizlingo.com";

interface ValidationResult {
  service: string;
  status: "✅ PASS" | "⚠️  WARNING" | "❌ FAIL";
  message: string;
  details?: Record<string, any>;
}

const results: ValidationResult[] = [];

async function validateCredentials() {
  console.log("🔍 Validating AWS Credentials...\n");

  // Check environment variables
  console.log("📋 Checking Environment Variables...");
  if (!process.env.AWS_ACCESS_KEY_ID) {
    results.push({
      service: "Environment",
      status: "❌ FAIL",
      message: "AWS_ACCESS_KEY_ID not set",
    });
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    results.push({
      service: "Environment",
      status: "❌ FAIL",
      message: "AWS_SECRET_ACCESS_KEY not set",
    });
  }

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    results.push({
      service: "Environment",
      status: "✅ PASS",
      message: "AWS credentials found",
      details: {
        region: AWS_REGION,
        sesRegion: AWS_SES_REGION,
        s3Region: AWS_S3_REGION,
        s3Bucket: AWS_S3_BUCKET,
      },
    });
  }

  // Test STS (Identity)
  console.log("🔐 Testing AWS Identity...");
  try {
    const sts = new STSClient({ region: AWS_REGION });
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    results.push({
      service: "AWS STS",
      status: "✅ PASS",
      message: "AWS credentials are valid",
      details: {
        accountId: identity.Account,
        userId: identity.UserId,
        arn: identity.Arn,
      },
    });
  } catch (error) {
    results.push({
      service: "AWS STS",
      status: "❌ FAIL",
      message: `Failed to verify credentials: ${error instanceof Error ? error.message : String(error)}`,
    });
    return;
  }

  // Test SES
  console.log("📧 Testing AWS SES...");
  try {
    const ses = new SESClient({ region: AWS_SES_REGION });

    // Check verified email addresses
    const verified = await ses.send(new ListVerifiedEmailAddressesCommand({}));

    if (verified.VerifiedEmailAddresses?.includes(EMAIL_FROM_ADDRESS)) {
      results.push({
        service: "AWS SES - Email Verification",
        status: "✅ PASS",
        message: `Email ${EMAIL_FROM_ADDRESS} is verified`,
        details: {
          verifiedEmails: verified.VerifiedEmailAddresses || [],
          region: AWS_SES_REGION,
        },
      });
    } else {
      results.push({
        service: "AWS SES - Email Verification",
        status: "⚠️  WARNING",
        message: `Email ${EMAIL_FROM_ADDRESS} is NOT verified in SES`,
        details: {
          verifiedEmails: verified.VerifiedEmailAddresses || [],
          action: `Verify ${EMAIL_FROM_ADDRESS} in AWS SES console`,
        },
      });
    }

    // Try to verify an email (this will fail if not in sandbox, but shows SES access)
    try {
      await ses.send(new VerifyEmailIdentityCommand({ EmailAddress: EMAIL_FROM_ADDRESS }));
      results.push({
        service: "AWS SES - Permission",
        status: "✅ PASS",
        message: "SES VerifyEmailIdentity permission granted",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("MessageRejected")) {
        results.push({
          service: "AWS SES - Permission",
          status: "✅ PASS",
          message: "SES VerifyEmailIdentity permission granted (email already verified)",
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    results.push({
      service: "AWS SES",
      status: "❌ FAIL",
      message: `SES test failed: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // Test S3
  console.log("💾 Testing AWS S3...");
  if (!AWS_S3_BUCKET) {
    results.push({
      service: "AWS S3",
      status: "❌ FAIL",
      message: "AWS_S3_BUCKET environment variable not set",
    });
  } else {
    try {
      const s3 = new S3Client({ region: AWS_S3_REGION });

      // Check if bucket exists and is accessible
      await s3.send(new HeadBucketCommand({ Bucket: AWS_S3_BUCKET }));
      results.push({
        service: "AWS S3 - Bucket Access",
        status: "✅ PASS",
        message: `S3 bucket ${AWS_S3_BUCKET} is accessible`,
        details: {
          bucket: AWS_S3_BUCKET,
          region: AWS_S3_REGION,
        },
      });

      // List objects to verify read permission
      try {
        await s3.send(new ListObjectsV2Command({ Bucket: AWS_S3_BUCKET, MaxKeys: 1 }));
        results.push({
          service: "AWS S3 - Read Permission",
          status: "✅ PASS",
          message: "S3 ListObjects permission granted",
        });
      } catch (error) {
        results.push({
          service: "AWS S3 - Read Permission",
          status: "⚠️  WARNING",
          message: `S3 ListObjects permission check failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("NoSuchBucket")) {
        results.push({
          service: "AWS S3",
          status: "❌ FAIL",
          message: `S3 bucket ${AWS_S3_BUCKET} does not exist`,
          details: {
            action: `Create bucket in AWS S3 console`,
            bucket: AWS_S3_BUCKET,
            region: AWS_S3_REGION,
          },
        });
      } else if (errorMsg.includes("AccessDenied")) {
        results.push({
          service: "AWS S3",
          status: "❌ FAIL",
          message: `Access denied to S3 bucket ${AWS_S3_BUCKET}`,
          details: {
            action: "Check IAM permissions for S3 access",
          },
        });
      } else {
        results.push({
          service: "AWS S3",
          status: "❌ FAIL",
          message: `S3 bucket test failed: ${errorMsg}`,
        });
      }
    }
  }

  // Print results
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATION RESULTS");
  console.log("=".repeat(60) + "\n");

  for (const result of results) {
    console.log(`${result.status} ${result.service}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      for (const [key, value] of Object.entries(result.details)) {
        const displayValue = Array.isArray(value)
          ? value.join(", ")
          : value;
        console.log(`   • ${key}: ${displayValue}`);
      }
    }
    console.log();
  }

  // Summary
  const passed = results.filter(r => r.status === "✅ PASS").length;
  const warnings = results.filter(r => r.status === "⚠️  WARNING").length;
  const failed = results.filter(r => r.status === "❌ FAIL").length;

  console.log("=".repeat(60));
  console.log(`SUMMARY: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  console.log("=".repeat(60) + "\n");

  if (failed > 0) {
    console.log("❌ Validation FAILED. Please fix the issues above before deploying.\n");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("⚠️  Validation completed with warnings. Review above before deploying.\n");
    process.exit(0);
  } else {
    console.log("✅ All validations passed! Ready for production.\n");
    process.exit(0);
  }
}

// Run validation
validateCredentials().catch((error) => {
  console.error("❌ Validation script error:", error);
  process.exit(1);
});
