import { describe, it, expect } from "vitest";
import { escapeHtml, sanitizeFilename, sanitizeUrl, redactSensitiveData } from "../sanitizer";

describe("Sanitization & Security Utilities", () => {
  describe("escapeHtml()", () => {
    it("escapes script tags and special HTML characters", () => {
      const malicious = '<script>alert("xss")</script>';
      expect(escapeHtml(malicious)).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
    });

    it("escapes single quotes and ampersands", () => {
      const input = "Tom & 'Jerry'";
      expect(escapeHtml(input)).toBe("Tom &amp; &#039;Jerry&#039;");
    });
  });

  describe("sanitizeFilename()", () => {
    it("strips path traversal tokens slash and dots", () => {
      expect(sanitizeFilename("../../etc/passwd")).toBe("etc_passwd");
      expect(sanitizeFilename("..\\..\\windows\\system32")).toBe("windows_system32");
    });

    it("replaces special characters with underscores", () => {
      expect(sanitizeFilename("my invoice #123 (final!).pdf")).toBe("my_invoice_123_final.pdf");
    });

    it("returns default fallback for empty input", () => {
      expect(sanitizeFilename("")).toBe("unnamed_file");
      expect(sanitizeFilename("..///")).toBe("unnamed_file");
    });
  });

  describe("sanitizeUrl()", () => {
    it("allows valid relative URLs", () => {
      expect(sanitizeUrl("/dashboard/products")).toBe("/dashboard/products");
    });

    it("allows standard HTTP and HTTPS URLs", () => {
      expect(sanitizeUrl("https://example.com/api")).toBe("https://example.com/api");
      expect(sanitizeUrl("http://localhost:8000")).toBe("http://localhost:8000");
    });

    it("blocks javascript: XSS pseudo-protocols", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
      expect(sanitizeUrl("javascript:void(0)")).toBe("#");
    });

    it("blocks protocol-relative protocol smuggling //malicious.com", () => {
      expect(sanitizeUrl("//malicious.com")).toBe("#");
    });
  });

  describe("redactSensitiveData()", () => {
    it("redacts sensitive password and token fields from log objects", () => {
      const logData = {
        username: "admin",
        password: "SuperSecretPassword123!",
        tokens: {
          access_token: "jwt-123",
          refresh_token: "jwt-refresh-456",
        },
        meta: {
          ip: "127.0.0.1",
        },
      };

      const redacted = redactSensitiveData(logData);

      expect(redacted.username).toBe("admin");
      expect(redacted.password).toBe("[REDACTED]");
      expect(redacted.tokens.access_token).toBe("[REDACTED]");
      expect(redacted.tokens.refresh_token).toBe("[REDACTED]");
      expect(redacted.meta.ip).toBe("127.0.0.1");
    });
  });
});
