// ==============================================================================
// Cryptographic Audit & Signature Engine (TypeScript Library)
// ==============================================================================

import crypto from "node:crypto";

export interface SignatureProof {
  hash: string;
  signature: string;
  algorithm: string;
}

/**
 * Generates an idempotent transaction reference identifier.
 */
export function generateTransactionId(prefix: string): string {
  const randomBytes = crypto.randomBytes(6).toString("hex");
  const timestamp = Date.now().toString(36);
  return `${prefix.toUpperCase()}-${timestamp}-${randomBytes}`;
}

/**
 * Computes a SHA-256 digest in hexadecimal format.
 */
export function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Signs a transaction payload using HMAC-SHA256.
 */
export function signPayload(payload: string, secretKey: string): SignatureProof {
  const hash = sha256Hex(payload);
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(hash)
    .digest("hex");

  return {
    hash,
    signature,
    algorithm: "HMAC-SHA256",
  };
}

/**
 * Verifies if an HMAC-SHA256 signature matches a payload.
 */
export function verifySignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  const expected = signPayload(payload, secretKey).signature;
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}
