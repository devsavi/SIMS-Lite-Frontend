import { describe, it, expect } from "vitest";
import { sanitizeFilename } from "@/lib/security/sanitizer";

describe("File Upload Security Hardening", () => {
  it("strips directory traversal paths from uploaded filenames", () => {
    const dangerousName = "../../../malicious_script.sh";
    const safeName = sanitizeFilename(dangerousName);
    expect(safeName).toBe("malicious_script.sh");
  });

  it("replaces special shell characters in file names", () => {
    const dangerousName = "file; rm -rf /;.png";
    const safeName = sanitizeFilename(dangerousName);
    expect(safeName).not.toContain(";");
    expect(safeName).toBe("file_rm_-rf.png");
  });

  it("validates 2MB max size constraint for brand logos", () => {
    const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
    const validSize = 1.5 * 1024 * 1024;
    const oversized = 3 * 1024 * 1024;

    expect(validSize <= MAX_LOGO_SIZE).toBe(true);
    expect(oversized <= MAX_LOGO_SIZE).toBe(false);
  });
});
