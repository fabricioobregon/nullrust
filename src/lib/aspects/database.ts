import { AspectDefinition } from "./types";

export const database: AspectDefinition = {
  key: "database",
  title: "Database",
  icon: "🗄️",
  tagline: "Engine, ORM, naming, keys, and indexing conventions.",
  scope: ["backend"],
  cards: [
    {
      id: "engine",
      title: "Database engine",
      description: "Which datastore does this project run on?",
      fields: [
        {
          id: "engine",
          label: "Primary database",
          type: "single",
          options: [
            {
              value: "postgresql",
              label: "PostgreSQL",
              description: "The default choice for most new projects — rich feature set, huge ecosystem.",
              recommended: true,
            },
            { value: "mysql", label: "MySQL", description: "Mature and widely hosted, slightly fewer advanced features than Postgres." },
            { value: "sqlite", label: "SQLite", description: "File-based, zero setup — great for local dev, not for concurrent production writes." },
            { value: "sqlserver", label: "SQL Server", description: "Common in .NET/Microsoft-centric environments." },
            { value: "mongodb", label: "MongoDB", description: "Document store — flexible schema, no joins." },
            { value: "cockroachdb", label: "CockroachDB", description: "Postgres-compatible, built for horizontal scaling across regions." },
            { value: "planetscale", label: "PlanetScale (MySQL)", description: "Managed MySQL with branching/schema-change workflows built in." },
            { value: "dynamodb", label: "DynamoDB", description: "AWS-native key-value store — scales effortlessly, no joins or ad-hoc queries." },
          ],
        },
      ],
    },
    {
      id: "orm",
      title: "ORM / query layer",
      description: "How the application talks to the database.",
      fields: [
        {
          id: "orm",
          label: "ORM or query builder",
          type: "single",
          options: [
            {
              value: "prisma",
              label: "Prisma",
              description: "Type-safe client generated from a schema file — the most common TS/JS default.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "drizzle",
              label: "Drizzle ORM",
              description: "SQL-like, lightweight, no code generation step.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "typeorm",
              label: "TypeORM",
              description: "Decorator-based, ActiveRecord or Data Mapper style.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "sequelize",
              label: "Sequelize",
              description: "Older, mature ORM — large ecosystem, more verbose API.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "knex",
              label: "Knex (query builder)",
              description: "Query builder, not a full ORM — closer to hand-written SQL with a nicer API.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "sqlalchemy",
              label: "SQLAlchemy",
              description: "The standard for Python — works with or without an ORM layer on top.",
              recommended: true,
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["python"] }],
            },
            {
              value: "django-orm",
              label: "Django ORM",
              description: "Built into Django — only makes sense if Framework is already Django.",
              // Two-level cascade: not just "language is Python" — the framework
              // itself must be Django, otherwise Django ORM makes no sense.
              compatibleWhen: [
                { aspectKey: "programming-language", fieldId: "language", values: ["python"] },
                { aspectKey: "framework", fieldId: "framework", values: ["django"] },
              ],
            },
            {
              value: "activerecord",
              label: "ActiveRecord",
              description: "Rails' built-in ORM — convention-driven, minimal config.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["ruby"] }],
            },
            {
              value: "mongoose",
              label: "Mongoose",
              description: "Schema layer for MongoDB — validation and modeling on top of a flexible store.",
              compatibleWhen: [{ aspectKey: "programming-language", fieldId: "language", values: ["typescript", "javascript"] }],
            },
            {
              value: "raw-sql",
              label: "Raw SQL / hand-written queries",
              description: "No abstraction layer — full control, more boilerplate.",
            },
          ],
        },
        {
          id: "migrations",
          label: "Migration strategy",
          type: "single",
          options: [
            {
              value: "orm-migrations",
              label: "ORM-managed migrations (e.g. prisma migrate, alembic)",
              description: "Generated from your schema/models — fastest path, tied to your ORM.",
              recommended: true,
            },
            { value: "sql-migrations", label: "Hand-written SQL migration files", description: "Full control over exactly what runs, more manual effort." },
            { value: "migration-tool", label: "Dedicated tool (Flyway, Liquibase, sqitch)", description: "Decoupled from any ORM — common in polyglot or enterprise environments." },
            { value: "none", label: "No formal migrations", description: "Schema changes happen ad hoc — rarely a good long-term choice." },
          ],
        },
      ],
    },
    {
      id: "naming",
      title: "Naming conventions",
      description: "How tables, columns, and code-level fields are cased.",
      fields: [
        {
          id: "column-case",
          label: "Column / table naming",
          type: "single",
          options: [
            { value: "snake_case", label: "snake_case (users, first_name)" },
            { value: "camelCase", label: "camelCase (users, firstName)" },
            { value: "PascalCase", label: "PascalCase (Users, FirstName)" },
          ],
        },
        {
          id: "model-case",
          label: "Application model / entity naming",
          type: "single",
          options: [
            { value: "PascalCase-singular", label: "PascalCase, singular (User, OrderItem)" },
            { value: "PascalCase-plural", label: "PascalCase, plural (Users, OrderItems)" },
            { value: "snake_case-singular", label: "snake_case, singular (user, order_item)" },
          ],
        },
        {
          id: "table-naming",
          label: "Table naming",
          type: "single",
          options: [
            { value: "plural", label: "Plural table names (users, orders)" },
            { value: "singular", label: "Singular table names (user, order)" },
          ],
        },
      ],
    },
    {
      id: "keys",
      title: "Primary keys & identifiers",
      description: "Default ID strategy for new tables.",
      fields: [
        {
          id: "id-type",
          label: "Primary key type",
          type: "single",
          options: [
            { value: "uuid-v4", label: "UUID v4", description: "Fully random — simple, but hurts index locality on large tables." },
            {
              value: "uuid-v7",
              label: "UUID v7 (time-ordered)",
              description: "Sortable by creation time, better index locality than v4 — the modern default.",
              recommended: true,
            },
            { value: "ulid", label: "ULID", description: "Similar benefits to UUID v7, more compact text representation." },
            { value: "cuid2", label: "CUID2", description: "Collision-resistant, URL-safe — common in JS/TS ecosystems." },
            { value: "auto-increment", label: "Auto-increment integer / bigint", description: "Simple and fast, but leaks row counts and complicates merges across environments." },
            { value: "composite", label: "Composite natural key", description: "No surrogate key — only fits specific, well-understood data models." },
          ],
        },
        {
          id: "id-column-name",
          label: "Primary key column name",
          type: "single",
          options: [
            { value: "id", label: "id" },
            { value: "table_id", label: "<table>_id (e.g. user_id)" },
            { value: "pk", label: "pk" },
          ],
        },
        {
          id: "foreign-key-naming",
          label: "Foreign key naming",
          type: "single",
          options: [
            { value: "singular_id", label: "<referenced_table_singular>_id (author_id)" },
            { value: "role_id", label: "Role-based name when ambiguous (created_by_id, reviewer_id)" },
          ],
        },
      ],
    },
    {
      id: "columns",
      title: "Default columns & indexing",
      description: "Baseline columns and indexes every table should carry.",
      fields: [
        {
          id: "default-columns",
          label: "Default columns on every table",
          type: "multi",
          options: [
            { value: "created_at", label: "created_at" },
            { value: "updated_at", label: "updated_at" },
            { value: "deleted_at", label: "deleted_at (soft delete)" },
            { value: "created_by", label: "created_by" },
            { value: "updated_by", label: "updated_by" },
            { value: "version", label: "version (optimistic locking)" },
          ],
        },
        {
          id: "default-indexes",
          label: "Default indexed columns",
          type: "multi",
          options: [
            { value: "foreign-keys", label: "All foreign key columns" },
            { value: "created_at", label: "created_at (for pagination/sorting)" },
            { value: "unique-natural-keys", label: "Unique natural keys (email, slug, external_id)" },
            { value: "soft-delete-flag", label: "deleted_at (for filtering active rows)" },
            { value: "search-columns", label: "Frequently filtered/search columns" },
          ],
        },
        {
          id: "timestamp-type",
          label: "Timestamp semantics",
          type: "single",
          options: [
            { value: "utc-timestamptz", label: "Always store UTC (timestamptz)" },
            { value: "local-with-tz-column", label: "Local time + separate timezone column" },
          ],
        },
      ],
    },
    {
      id: "patterns",
      title: "Data access patterns",
      description: "Conventions to guard-rail how the app reads and writes data.",
      fields: [
        {
          id: "access-patterns",
          label: "Patterns to adopt",
          type: "multi",
          options: [
            { value: "repository-pattern", label: "Repository pattern (no ORM calls outside a data layer)" },
            { value: "soft-deletes", label: "Soft deletes instead of hard deletes" },
            { value: "no-raw-sql-in-app", label: "No raw SQL string interpolation in application code" },
            { value: "transactions-for-multi-write", label: "Wrap multi-table writes in transactions" },
            { value: "connection-pooling", label: "Explicit connection pooling / pgbouncer" },
            { value: "read-replicas", label: "Read replica awareness for read-heavy queries" },
            { value: "seed-scripts", label: "Seed scripts for local/dev data" },
          ],
        },
      ],
    },
  ],
};
