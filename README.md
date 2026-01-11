# NX PostGraphile Starter

A production-ready [PostGraphile 5](https://grafast.org/postgraphile/) GraphQL API starter built with [Nx](https://nx.dev), **Fastify**, and PostgreSQL.

> 🚀 **Why Fastify?** This project uses Fastify instead of Express for **2-3x better performance** under load. See [Performance Comparison](#-fastify-vs-express-performance) below.

## Features

- 🚀 **PostGraphile 5** - Next-generation GraphQL API from your PostgreSQL schema
- ⚡ **Fastify** - High-performance HTTP framework (2-3x faster than Express)
- 📦 **Nx Monorepo** - Scalable workspace with libraries and applications
- 🔒 **Production-ready** - Includes health checks, graceful shutdown, proper error handling, rate limiting, and GraphQL query complexity validation
- 📝 **Pino Logging** - Structured JSON logging with Fastify's native Pino integration and request tracing
- 🔧 **Environment Validation** - Type-safe configuration using [Joi](https://github.com/hapijs/joi)
- 🐳 **Docker Integration** - `docker-compose` for easy local development setup
- 🔄 **GitHub Actions CI** - Automated linting, testing, and building
- 🏊 **Connection Pooling** - Optimized pg Pool configuration for production
- 🧪 **Testing** - Jest-based unit and e2e testing
- 🤖 **GraphQL Codegen** - Type generation for your GraphQL schema

## Project Structure

```
├── apps/
│   ├── api/                 # Fastify + PostGraphile server
│   │   └── src/
│   │       ├── main.ts      # Application entry point
│   │       ├── middleware/  # Fastify plugins and error handling
│   │       ├── router/      # Route definitions (health, api)
│   │       └── server/      # GraphQL and shutdown handlers
│   └── api-e2e/             # End-to-end tests
├── libs/
│   ├── database/            # Database pool and configuration
│   ├── gql/                 # PostGraphile preset and plugins
│   └── utils/               # Shared utilities (logger, config, health checks)
├── performance/             # Performance testing suite
│   ├── src/                 # Test runner and definitions
│   └── results/             # Benchmark results
```

## Quick Start

##Yarn

- Docker

### Installation

```bash
# Install dependencies
yarn install
```

### Running the Database

In a separate terminal, start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This will start a PostgreSQL container and expose it on port `5432`.

### Configuration

Create a `.env` file in the root directory. You can copy the example file:

```bash
cp .env.example .env
```

The default `DATABASE_URL` in `.env.example` is configured to work with the `docker-compose` setup.

### Running the Application

```bash
# Development mode with hot reload
yarn start api

# Build for production
yarn build api

# Run unit tests
yarn test utils
yarn test database

# Run e2e tests
yarn e2e api-build

# Run e2e tests
yarn api:e2e
```

## API Endpoints

| Endpoint    | Description                     |
| ----------- | ------------------------------- |
| `/graphql`  | GraphQL API endpoint            |
| `/graphiql` | GraphiQL IDE (development only) |
| `/api`      | API info endpoint               |
| `/live`     | Kubernetes liveness probe       |
| `/health`   | Comprehensive health check      |
| `/ready`    | Kubernetes readiness probe      |

## Performance

### 🔥 Fastify vs Express Performance

This project uses **Fastify** for significantly better performance. Here's how it compares to Express under stress testing (100 concurrent connections, 60 seconds):

| Endpoint                  | Express (req/s) | Fastify (req/s) | **Improvement** |
| ------------------------- | --------------- | --------------- | --------------- |
| **Liveness Probe**        | 8,844           | 26,749          | **+202%**       |
| **API Root**              | 7,000           | 19,702          | **+181%**       |
| **Readiness Probe**       | 5,663           | 10,383          | **+83%**        |
| **Health Check**          | 5,794           | 9,907           | **+71%**        |
| **GraphQL Query**         | 5,898           | 11,228          | **+90%**        |
| **GraphQL Introspection** | 5,168           | 7,897           | **+53%**        |

#### Key Performance Benefits

- ⚡ **2-3x higher throughput** for REST endpoints under load
- 📉 **50-70% lower latency** across all endpoints
- 🎯 **More stable P99 latencies** (7-95ms vs 21-65ms with Express)
- 🔄 **Better connection handling** under high concurrency

### Benchmark Results (Fastify)

> **Test Environment**: MacBook Air M1, Node.js v20, PostgreSQL 15  
> **Test Parameters**: 100 concurrent connections, 60 seconds duration

#### REST API Performance

| Endpoint  | Req/sec | Avg Latency | P99 Latency | Throughput |
| --------- | ------- | ----------- | ----------- | ---------- |
| `/live`   | 26,749  | 3.26 ms     | 7 ms        | 15.6 MB/s  |
| `/api`    | 19,702  | 4.62 ms     | 15 ms       | 11.5 MB/s  |
| `/ready`  | 10,383  | 9.13 ms     | 17 ms       | 5.96 MB/s  |
| `/health` | 9,907   | 9.60 ms     | 21 ms       | 7.46 MB/s  |

#### GraphQL Performance

| Query         | Req/sec | Avg Latency | P99 Latency | Throughput |
| ------------- | ------- | ----------- | ----------- | ---------- |
| Simple Query  | 11,228  | 8.42 ms     | 32 ms       | 8.69 MB/s  |
| Node Query    | 10,102  | 9.43 ms     | 61 ms       | 7.58 MB/s  |
| \_\_typename  | 8,156   | 11.78 ms    | 78 ms       | 9.19 MB/s  |
| Introspection | 7,897   | 12.18 ms    | 95 ms       | 11.0 MB/s  |

#### Key Metrics

- ⚡ **Peak Throughput**: 26,749 req/s (liveness endpoint)
- 🚀 **GraphQL Throughput**: 11,228 req/s (simple queries)
- 📊 **P99 Latency**: < 100ms for all endpoints under stress
- ✅ **Error Rate**: 0%

### Running Performance Tests

```bash
# Start the API server
yarn start

# Run all performance tests
yarn perf:test

# Run specific test(s)
yarn perf:run health
yarn perf:run health,live,graphql_typename

# Run by category
yarn perf:rest
yarn perf:graphql

# Stress test (100 connections, 60 seconds)
yarn perf:stress
```

See [performance/README.md](performance/README.md) for detailed documentation.

## Environment Variables

| Variable               | Description                                     | Default                                                |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| `NODE_ENV`             | Environment (development/production)            | `development`                                          |
| `PORT`                 | Server port                                     | `3000`                                                 |
| `APP_NAME`             | Application name for logging                    | `postgraphile-api`                                     |
| `LOG_LEVEL`            | Logging level                                   | `info`                                                 |
| `DATABASE_URL`         | PostgreSQL connection string                    | `postgres://postgres:postgres@localhost:5432/postgres` |
| `DATABASE_SCHEMAS`     | Comma-separated schema names                    | `public`                                               |
| `DATABASE_POOL_MAX`    | Maximum pool connections                        | `20`                                                   |
| `DATABASE_POOL_MIN`    | Minimum pool connections                        | `2`                                                    |
| `DATABASE_SSL`         | Enable SSL connection                           | `false`                                                |
| `JWT_SECRET`           | Secret for JWT authentication                   | -                                                      |
| `RATE_LIMIT_MAX`       | Max requests per window (rate limiting)         | `100`                                                  |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms                         | `60000`                                                |
| `GRAPHQL_DEPTH_LIMIT`  | Max GraphQL query depth (complexity validation) | `10`                                                   |
| `GRAPHQL_COST_LIMIT`   | Max GraphQL query cost (complexity validation)  | `1000`                                                 |

## Security Features

### Rate Limiting

The API enforces rate limiting to protect against abuse and DoS attacks. Configure limits using the `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` environment variables.

### GraphQL Query Complexity Validation

To prevent expensive or malicious GraphQL queries, the server validates both query depth and cost. Configure limits using `GRAPHQL_DEPTH_LIMIT` and `GRAPHQL_COST_LIMIT`.

If a query exceeds these limits, the server returns a 400 error with details in the response.

## Libraries

### @app/database

Database connection pool and configuration.

```typescript
import { getPool, query, withTransaction, closePool } from '@app/database';

// Execute a query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Use transactions
await withTransaction(async client => {
    await client.query('INSERT INTO ...');
    await client.query('UPDATE ...');
});
```

### @app/utils

Shared utilities including logging, configuration, and health checks.

```typescript
import { logger, env, registerHealthCheck } from '@app/utils';

// Structured logging (standalone, for startup/background tasks)
logger.info({ userId }, 'User logged in');

// Access validated environment
console.log(env.DATABASE_URL);

// Register custom health checks
registerHealthCheck('redis', async () => {
    // Check redis connection
    return { healthy: true, latencyMs: 5 };
});
```

### @app/gql

GraphQL types, plugins, and utilities.

```typescript
import { LoggingPlugin } from '@app/gql';
import type { WrapPlanContext } from '@app/gql';
```

#### GraphQL Logging

The `LoggingPlugin` provides automatic request tracing for all GraphQL operations:

- **Trace ID correlation** - Every request gets a unique `traceId` (from `x-request-id` header or auto-generated)
- **Operation timing** - Automatic measurement of query/mutation execution time
- **Structured logs** - Operation name, type, duration, and errors in JSON format

```json
{
    "level": "info",
    "time": "2026-01-11T10:30:00.000Z",
    "traceId": "abc-123",
    "graphql": { "operation": "GetUser", "type": "query" },
    "durationMs": 12.5,
    "msg": "GraphQL query GetUser completed in 12.5ms"
}
```

Access the logger in resolver functions via the grafast context:

```typescript
import { context, sideEffect } from 'grafast';

// In a wrapPlan function
const $logger = context().get('logger');
sideEffect($logger, logger => {
    logger.info({ customData: 'value' }, 'Custom log from resolver');
});
```

### GQL CRUD Generator

Generate type-safe wrapPlan libraries for your GraphQL types:

```bash
# Generate library with default naming ({typePlural}-api)
yarn gen:gql-crud User        # Creates libs/users-api/

# Generate library with custom name
yarn gen:gql-crud User --name users    # Creates libs/users/
```

This creates a library with wrapPlan functions for:

- **Queries**: `userQueryWrapPlan`, `userByIdQueryWrapPlan`, `usersConnectionWrapPlan`
- **Mutations**: `createUserWrapPlan`, `updateUserWrapPlan`, `deleteUserWrapPlan`

See [tools/generators/gql-crud/README.md](tools/generators/gql-crud/README.md) for full documentation.

## Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `yarn start api`        | Start development server             |
| `yarn build api`        | Build the API for production         |
| `yarn api:e2e`          | Run e2e tests for the API            |
| `yarn lint`             | Run linting on all projects          |
| `yarn test <lib>`       | Run unit tests for a library         |
| `yarn all:test`         | Run tests for all projects           |
| `yarn all:build`        | Build all projects                   |
| `yarn format`           | Format code with Prettier            |
| `yarn db:up`            | Start PostgreSQL via Docker          |
| `yarn db:down`          | Stop and remove PostgreSQL           |
| `yarn db:logs`          | View PostgreSQL container logs       |
| `yarn gen:gql-crud`     | Generate wrapPlan library for a type |
| `yarn perf:test`        | Run all performance tests            |
| `yarn perf:list`        | List available performance tests     |
| `yarn perf:run <tests>` | Run specific test(s)                 |
| `yarn perf:rest`        | Run REST endpoint tests              |
| `yarn perf:graphql`     | Run GraphQL tests                    |
| `yarn perf:stress`      | Stress test (100 connections, 60s)   |

```dockerfile
# Stage 1: Build the application
FROM node:24 as builder
WORKDIR /app
COPY package.json yarn.lock ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY .yarn ./
RUN yarn install --immutable
COPY . .
RUN npx nx build api

# Stage 2: Create the final production image
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/api/package.json ./
COPY --from=builder /app/dist/apps/api/yarn.lock ./
RUN yarn workspaces focus --all --production
COPY --from=builder /app/dist/apps/api .
EXPOSE 3000
CMD ["node", "main.js"]
```

### Health Checks

The application exposes three health endpoints for Kubernetes:

- **`/live`** - Liveness probe (is the process running?)
- **`/ready`** - Readiness probe (is the app ready to serve traffic?)
- **`/health`** - Detailed health report with all component statuses

Example Kubernetes configuration:

```yaml
livenessProbe:
    httpGet:
        path: /live
        port: 3000
    initialDelaySeconds: 10
    periodSeconds: 10
readinessProbe:
    httpGet:
        path: /ready
        port: 3000
    initialDelaySeconds: 5
    periodSeconds: 5
```

## License

MIT

- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
