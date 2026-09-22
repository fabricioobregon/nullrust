import { AspectDefinition } from "./types";

export const caching: AspectDefinition = {
  key: "caching",
  title: "Caching",
  icon: "⚡",
  tagline: "Caching layers, invalidation strategy, and session storage.",
  cards: [
    {
      id: "layers",
      title: "Caching layers",
      fields: [
        {
          id: "layers",
          label: "Layers in use",
          type: "multi",
          options: [
            { value: "cdn", label: "CDN edge caching" },
            { value: "http-cache-headers", label: "HTTP cache headers (Cache-Control/ETag)" },
            { value: "server-in-memory", label: "In-process server memory cache" },
            { value: "distributed-cache", label: "Distributed cache (Redis/Memcached)" },
            { value: "database-query-cache", label: "Database query result cache" },
            { value: "framework-data-cache", label: "Framework-level data cache (e.g. Next.js fetch cache)" },
          ],
        },
        {
          id: "cache-store",
          label: "Distributed cache store",
          type: "single",
          options: [
            { value: "redis", label: "Redis" },
            { value: "memcached", label: "Memcached" },
            { value: "dynamodb-dax", label: "DynamoDB Accelerator (DAX)" },
            { value: "none", label: "None" },
          ],
        },
      ],
    },
    {
      id: "invalidation",
      title: "Invalidation strategy",
      fields: [
        {
          id: "strategy",
          label: "Primary invalidation strategy",
          type: "single",
          options: [
            { value: "ttl-based", label: "TTL-based expiry" },
            { value: "tag-based", label: "Tag/key-based on-demand invalidation" },
            { value: "write-through", label: "Write-through cache updates on mutation" },
            { value: "event-driven", label: "Event-driven invalidation (pub/sub on change)" },
          ],
        },
        {
          id: "patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "cache-stampede-protection", label: "Cache stampede protection (locking/request coalescing)" },
            { value: "stale-while-revalidate", label: "Stale-while-revalidate for read-heavy endpoints" },
            { value: "cache-key-includes-version", label: "Cache keys include a schema/version component" },
            { value: "no-caching-sensitive-data", label: "Never cache personally-identifiable or per-user sensitive data at shared layers" },
          ],
        },
      ],
    },
    {
      id: "session-storage",
      title: "Session & state storage",
      fields: [
        {
          id: "session-store",
          label: "Where session/state lives",
          type: "single",
          options: [
            { value: "redis-session", label: "Redis-backed session store" },
            { value: "signed-cookie", label: "Signed/encrypted cookie, no server-side store" },
            { value: "db-session", label: "Database-backed session table" },
            { value: "jwt-stateless", label: "Stateless JWT, no server-side session" },
          ],
        },
      ],
    },
  ],
};
