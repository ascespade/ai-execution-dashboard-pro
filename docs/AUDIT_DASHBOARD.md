# Dashboard Truth Audit Report

**Date:** 2025-12-27
**Project:** AI Execution Dashboard - Hardening & Live Integration
**Status:** P0 - Complete

---

## Executive Summary

This audit identifies all mock-data usage, validates the API client implementation, and maps out the remaining work required to achieve production readiness with live platform integration.

---

## 1. Mock Data Usage Audit

### 1.1 Files Still Using Mock Data

| File | Import | Risk Level | Action Required |
|------|--------|------------|-----------------|
| `src/app/templates/page.tsx` | `mockTemplates` | HIGH | Wire live data or add empty state |
| `src/app/repositories/page.tsx` | `mockRepositories` | HIGH | Wire live data or add empty state |
| `src/app/agents/page.tsx` | `mockAgents` | HIGH | Wire live data or add empty state |

### 1.2 Files Already Updated (✅)

| File | Status |
|------|--------|
| `src/app/page.tsx` | ✅ Uses live hooks (useOrchestrations, usePlatformHealth) |
| `src/app/orchestrations/page.tsx` | ✅ Uses live hooks (useOrchestrations) |

### 1.3 Risk Assessment

- **Dashboard:** ✅ Safe - uses real data
- **Orchestrations:** ✅ Safe - uses real data
- **Templates/Repositories/Agents:** ⚠️ Still using mock data - need P2 completion

---

## 2. API Client Analysis

### 2.1 Header Injection Status

| Header | Implementation | Status |
|--------|----------------|--------|
| `x-api-key` | Injected when `config.apiKey` is set (line 321-323) | ✅ PASS |
| `x-request-id` | Generated via `uuidv4()` per request (line 317) | ✅ PASS |
| `Content-Type` | Always set to `application/json` (line 316) | ✅ PASS |

### 2.2 Zod Schema Validation

| Schema | Location | Status |
|--------|----------|--------|
| `HealthResponseSchema` | Lines 12-18 | ✅ PASS |
| `ReadinessResponseSchema` | Lines 23-27 | ✅ PASS |
| `OrchestrationSummarySchema` | Lines 32-45 | ✅ PASS |
| `OrchestrationListResponseSchema` | Lines 50-55 | ✅ PASS |
| `TelemetryResponseSchema` | Lines 60-66 | ✅ PASS |
| `CreateOrchestrationRequestSchema` | Lines 71-81 | ✅ PASS |

### 2.3 Error Classification

| Error Kind | Used | Status |
|------------|------|--------|
| `AUTH_REQUIRED` | Yes | ✅ PASS |
| `AUTH_FORBIDDEN` | Yes | ✅ PASS |
| `RATE_LIMIT` | Yes | ✅ PASS |
| `NETWORK` | Yes | ✅ PASS |
| `TIMEOUT` | Yes | ✅ PASS |
| `VALIDATION` | Yes | ✅ PASS |
| `NOT_FOUND` | Yes | ✅ PASS |
| `SERVER_5XX` | Yes | ✅ PASS |
| `SCHEMA_DRIFT` | Yes | ✅ PASS |
| `UNKNOWN` | Yes | ✅ PASS |

### 2.4 Circuit Breaker Pattern

| State | Implementation | Status |
|-------|----------------|--------|
| Closed → Open | After 5 failures (configurable) | ✅ PASS |
| Open → Half-Open | After `resetTimeoutMs` (30s default) | ✅ PASS |
| Half-Open → Closed | On successful request | ✅ PASS |

---

## 3. Configuration Store Audit

### 3.1 State Management

| Field | Type | Persisted | Status |
|-------|------|-----------|--------|
| `baseUrl` | string | Yes | ✅ PASS |
| `apiKey` | string | Yes | ✅ PASS |
| `isConfigured` | boolean | Computed | ✅ PASS |
| `isConnecting` | boolean | No | ✅ PASS |
| `lastConnectionStatus` | 'success' \| 'failed' \| null | No | ✅ PASS |
| `lastConnectionTime` | string \| null | No | ✅ PASS |
| `lastLatency` | number \| null | No | ✅ PASS |

### 3.2 Actions

| Action | Implemented | Status |
|--------|-------------|--------|
| `setBaseUrl()` | Yes | ✅ PASS |
| `setApiKey()` | Yes | ✅ PASS |
| `setConnecting()` | Yes | ✅ PASS |
| `setConnectionStatus()` | Yes | ✅ PASS |
| `reset()` | Yes | ✅ PASS |
| `loadFromStorage()` | Yes | ✅ PASS |

### 3.3 Selectors

| Selector | Exists | Status |
|----------|--------|--------|
| `selectBaseUrl` | Yes | ✅ PASS |
| `selectApiKey` | Yes | ✅ PASS |
| `selectIsConfigured` | Yes | ✅ PASS |
| `selectConnectionStatus` | Yes | ✅ PASS |

---

## 4. Connection Status UI Audit

### 4.1 Header Component

| Element | Status | Action Required |
|---------|--------|-----------------|
| Connection Status Indicator | ❌ MISSING | Add ConnectionStatusBadge component |
| Platform Base URL display | ❌ MISSING | Add to status tooltip |
| Last check timestamp | ❌ MISSING | Add to status indicator |
| Settings link | ✅ EXISTS | Keep as-is |

### 4.2 Settings Page

| Element | Status | Action Required |
|---------|--------|-----------------|
| Platform Configuration | ❌ MISSING | Add Platform Settings tab |
| Base URL input | ❌ MISSING | Add to platform settings |
| API Key input | ❌ MISSING | Add to platform settings |
| Test Connection button | ❌ MISSING | Add and wire to `useTestConnection()` |
| Connection status display | ❌ MISSING | Show last check result + latency |
| Error remediation hints | ❌ MISSING | Show based on error kind |

---

## 5. Routes That Can Hang (Loading Analysis)

### 5.1 Routes with Live Data

| Route | Hook Used | Timeout | Status |
|-------|-----------|---------|--------|
| `/` (Dashboard) | usePlatformHealth, useOrchestrations | 10s (default) | ⚠️ Need verify |
| `/orchestrations` | useOrchestrations | 10s (default) | ⚠️ Need verify |

### 5.2 Routes with Mock Data

| Route | Current State | Risk Level |
|-------|---------------|------------|
| `/templates` | Mock data - no network | HIGH |
| `/repositories` | Mock data - no network | HIGH |
| `/agents` | Mock data - no network | HIGH |

### 5.3 Recommendations

1. Add `AbortController` with 10s timeout to all hooks
2. Implement global loading boundary component
3. Create DiagnosticsPanel that triggers on timeout

---

## 6. Fix Plan by Phase

### Phase P0 (Audit - Complete)
- ✅ Create this audit document
- ✅ Enumerate all mock-data usage
- ✅ Identify missing components

### Phase P1 (Platform Integration)
- [ ] Add ConnectionStatusBadge to Header
- [ ] Create Platform Settings tab in Settings page
- [ ] Wire Test Connection button to useTestConnection()
- [ ] Display connection status and last check time

### Phase P2 (Mock Data Removal)
- [ ] Refactor `/templates/page.tsx` - remove mock data
- [ ] Refactor `/repositories/page.tsx` - remove mock data
- [ ] Refactor `/agents/page.tsx` - remove mock data
- [ ] Add graceful empty states

### Phase P3 (UX Hardening)
- [ ] Implement global loading boundary with 10s timeout
- [ ] Create DiagnosticsPanel component
- [ ] Add timeout -> diagnostics flow
- [ ] Implement error remediation display

### Phase P4 (Quality Gates)
- [ ] Run type-check: `npm run type-check`
- [ ] Run lint: `npm run lint`
- [ ] Run tests: `npm run test`
- [ ] Run build: `npm run build`

### Phase P5 (Railway Readiness)
- [ ] Verify Dockerfile
- [ ] Create RAILWAY.md
- [ ] Create scripts/verify-production.sh
- [ ] Generate FINAL_REPORT.md with Reliability Score

---

## 7. Test Evidence Checklist

- [ ] TypeScript compilation passes (0 errors)
- [ ] ESLint passes (0 warnings)
- [ ] Build succeeds
- [ ] All unit tests pass
- [ ] E2E smoke tests pass
- [ ] Connection status indicator visible in header
- [ ] Test connection button functional
- [ ] No infinite loading states
- [ ] Error remediation displayed correctly

---

## 8. Assumptions & Decisions

1. **Auth Model:** Using x-api-key header exclusively (no bearer tokens)
2. **Config Storage:** Using localStorage (client-side only, no cookies)
3. **Error Codes:** Following the ErrorKind enum defined in apiClient.ts
4. **Timeout Policy:** 10 seconds hard timeout with diagnostics trigger
5. **Connection Status:** Stored in Zustand store (not persisted to localStorage)

---

## 9. Next Steps

Proceed to **Phase P1** - Add Connection Status Indicator to Header and wire Test Connection functionality.
