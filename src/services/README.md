# Services

`prospect-store.ts` owns browser-local reads, writes, and subscription updates. `workspace-schema.ts` validates the versioned workspace at its I/O boundary. Domain rules remain in `src/features/prospects/domain`.

No external service is connected. Saves write successfully before updating the visible snapshot. Corrupted data is preserved rather than silently replaced. Add external adapters only when explicitly authorized.
