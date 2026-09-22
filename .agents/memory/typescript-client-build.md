---
name: Shared client TypeScript build
description: The generated API client uses Headers.entries and needs iterable DOM types enabled.
---

The shared API client TypeScript config must include `dom.iterable` alongside `dom` when generated fetch helpers use `Headers.entries()`.

**Why:** The generated client otherwise fails the workspace library typecheck even though the generated code and app behavior are valid.

**How to apply:** If codegen introduces `Headers.entries()` type errors, check the client library `lib` list before editing generated output.