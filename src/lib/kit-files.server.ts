/** Paid files for products that deliver a download instead of the generated .txt. */
export async function kitFileBytes(kitId: string): Promise<Uint8Array<ArrayBuffer> | null> {
  if (kitId === "ready-safe-build-kit") {
    const { SAFE_BUILD_KIT_ZIP_BASE64 } = await import("./kit-files/safe-build-kit.zip.server.ts");
    return new Uint8Array(Buffer.from(SAFE_BUILD_KIT_ZIP_BASE64, "base64"));
  }
  if (kitId === "ready-teen-build-kit") {
    const { TEEN_BUILD_KIT_ZIP_BASE64 } = await import("./kit-files/teen-build-kit.zip.server.ts");
    return new Uint8Array(Buffer.from(TEEN_BUILD_KIT_ZIP_BASE64, "base64"));
  }
  return null;
}
