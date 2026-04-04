/**
 * Platform/runtime detection utility.
 */

export type PlatformType = "aws" | "local";

export function getPlatform(): PlatformType {
  const explicit = process.env.PLATFORM?.trim().toLowerCase();
  if (explicit === "aws" || explicit === "local") {
    return explicit;
  }
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV)
    return "aws";
  return "local";
}

export function isServerless(): boolean {
  return getPlatform() === "aws";
}

/**
 * Writable temp directory.
 * Lambda: /tmp (ephemeral). Local/Amplify SSR: process.cwd().
 */
export function getWritableBaseDir(): string {
  return isServerless() ? "/tmp" : process.cwd();
}
