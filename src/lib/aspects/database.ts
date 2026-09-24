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
            { value: "postgresql", label: "PostgreSQL" },
            { value: "mysql", label: "MySQL" },
            { value: "sqlite", label: "SQLite" },
            { value: "sqlserver", label: "SQL Server" },
            { value: "mongodb", label: "MongoDB" },
            { value: "cockroachdb", label: "CockroachDB" },
            { value: "planetscale", label: "PlanetScale (MySQL)" },
            { value: "dynamodb", label: "DynamoDB" },
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
            { value: "prisma", label: "Prisma" },
            { value: "drizzle", label: "Drizzle ORM" },
            { value: "typeorm", label: "TypeORM" },
            { value: "sequelize", label: "Sequelize" },
            { value: "knex", label: "Knex (query builder)" },
            { value: "sqlalchemy", label: "SQLAlchemy" },
            { value: "django-orm", label: "Django ORM" },
            { value: "activerecord", label: "ActiveRecord" },
            { value: "mongoose", label: "Mongoose" },
            { value: "raw-sql", label: "Raw SQL / hand-written queries" },
          ],
        },
        {
          id: "migrations",
          label: "Migration strategy",
          type: "single",
          options: [
            { value: "orm-migrations", label: "ORM-managed migrations (e.g. prisma migrate, alembic)" },
            { value: "sql-migrations", label: "Hand-written SQL migration files" },
            { value: "migration-tool", label: "Dedicated tool (Flyway, Liquibase, sqitch)" },
            { value: "none", label: "No formal migrations" },
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
            { value: "uuid-v4", label: "UUID v4" },
            { value: "uuid-v7", label: "UUID v7 (time-ordered)" },
            { value: "ulid", label: "ULID" },
            { value: "cuid2", label: "CUID2" },
            { value: "auto-increment", label: "Auto-increment integer / bigint" },
            { value: "composite", label: "Composite natural key" },
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
