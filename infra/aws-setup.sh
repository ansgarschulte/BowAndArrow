#!/bin/bash
# AWS Infrastructure Setup for bogen.kalker.me
# Run this script once to create the required AWS resources
# Prerequisites: AWS CLI configured, Route53 hosted zone for kalker.me

set -e

REGION="eu-central-1"
CERT_REGION="us-east-1" # CloudFront requires certs in us-east-1
HOSTED_ZONE_DOMAIN="kalker.me"

echo "=== Setting up AWS infrastructure for Bow & Arrow game ==="

# 1. Create S3 buckets
echo "Creating S3 buckets..."
for BUCKET in "bogen.kalker.me" "bogen.dev.kalker.me"; do
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || echo "Bucket $BUCKET already exists"

  # Enable static website hosting
  aws s3 website "s3://$BUCKET" \
    --index-document index.html \
    --error-document index.html

  # Set bucket policy for public access
  aws s3api put-bucket-policy --bucket "$BUCKET" --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${BUCKET}/*\"
    }]
  }"

  # Disable block public access
  aws s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

  echo "  ✓ $BUCKET configured"
done

# 2. Request ACM certificates (in us-east-1 for CloudFront)
echo ""
echo "Requesting SSL certificates..."
PROD_CERT_ARN=$(aws acm request-certificate \
  --domain-name "bogen.kalker.me" \
  --validation-method DNS \
  --region "$CERT_REGION" \
  --query 'CertificateArn' --output text)
echo "  Production cert ARN: $PROD_CERT_ARN"

DEV_CERT_ARN=$(aws acm request-certificate \
  --domain-name "bogen.dev.kalker.me" \
  --validation-method DNS \
  --region "$CERT_REGION" \
  --query 'CertificateArn' --output text)
echo "  Dev cert ARN: $DEV_CERT_ARN"

echo ""
echo "⚠️  IMPORTANT: You need to validate the certificates!"
echo "   1. Go to AWS ACM console (us-east-1)"
echo "   2. Add the CNAME records to your Route53 hosted zone"
echo "   3. Wait for validation (can take a few minutes)"
echo ""
echo "After certificate validation, create CloudFront distributions manually or extend this script."
echo ""
echo "=== Required GitHub Secrets ==="
echo "  AWS_ROLE_ARN: (create OIDC role for GitHub Actions)"
echo "  CF_DISTRIBUTION_ID_PROD: (CloudFront distribution ID for bogen.kalker.me)"
echo "  CF_DISTRIBUTION_ID_DEV: (CloudFront distribution ID for bogen.dev.kalker.me)"
