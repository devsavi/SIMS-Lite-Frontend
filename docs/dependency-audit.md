# SIMS Lite Frontend — Dependency Security Audit & Supply Chain Security

## 1. Overview

Frontend dependencies were audited for vulnerabilities, license compatibility, and unused packages.

## 2. Core Dependency Security Summary

| Library | Version | Category | Vulnerability Status | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| `next` | `16.2.11` | Framework | Clean | Low |
| `react` / `react-dom` | `19.2.4` | Core UI | Clean | Low |
| `axios` | `^1.7.9` | HTTP Client | Clean | Low |
| `zustand` | `^5.0.0` | State Management | Clean | Low |
| `@tanstack/react-query` | `^5.62.0` | Server State | Clean | Low |
| `@hookform/resolvers` / `zod` | `^3.24.0` | Form Validation | Clean | Low |
| `react-dropzone` | `^14.4.1` | File Uploads | Clean | Low |
| `lucide-react` | `^0.468.0` | Icons | Clean | Low |

---

## 3. Dependency Maintenance Guidelines

1. **Automated Vulnerability Scans**: Run `npm audit` on every CI pipeline build.
2. **Lockfile Integrity**: Always check in `package-lock.json` to ensure reproducible, non-tampered builds across team developers and deployment environments.
3. **Unused Dependency Pruning**: Perform quarterly audits to prune obsolete npm packages and maintain minimal bundle footprint.
