---

name: Performance Report
about: Report a performance issue, regression, or optimization opportunity
title: "[PERF] "
labels: performance
assignees: ""
-------------

## Performance Issue Description

Describe the performance problem you observed.

Examples:

* Slow permission checks
* Increased memory usage
* Unexpected allocations
* Slower startup time
* Bundle size growth

---

## Expected Behavior

Describe the expected performance.

Example:

> Permission checks should remain constant-time even with large role hierarchies.

---

## Actual Behavior

Describe the observed behavior.

Include:

* Execution times
* Memory usage
* Throughput
* Benchmark results

---

## Environment

### next-rbac Version

```text
e.g. 0.1.0
```

### Runtime

* [ ] Node.js
* [ ] Browser
* [ ] Edge Runtime

### Framework

* [ ] Next.js
* [ ] React
* [ ] Express
* [ ] NestJS
* [ ] Other

### Versions

```text
Node.js:
TypeScript:
Framework:
Package Manager:
OS:
```

---

## Reproduction

Provide a minimal reproducible example.

```ts
// Example code
```

---

## Benchmark Results

If available, provide benchmark data.

Example:

```text
Before:
100,000 checks/sec

After:
45,000 checks/sec
```

---

## Memory Impact

If applicable, provide memory usage information.

Example:

```text
Before:
15 MB

After:
40 MB
```

---

## Bundle Size Impact

If applicable, provide bundle size measurements.

```text
Before:
8.2 KB gzip

After:
12.6 KB gzip
```

---

## Additional Context

Include any additional information, profiling screenshots, flamegraphs, benchmark reports, or links that may help identify the issue.

---

## Possible Optimization (Optional)

If you have ideas for improving performance, describe them here.
