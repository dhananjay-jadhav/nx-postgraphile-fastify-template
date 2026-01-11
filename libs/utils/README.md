# @app/utils

Shared utilities for logging, configuration, health checks, and error handling.

## Features

- **Pino Logger** - Structured JSON logging with Fastify integration
- **Environment Config** - Type-safe configuration with Joi validation
- **Health Checks** - Kubernetes-ready health check system
- **Error Handling** - Centralized error handling utilities

## Logging

### Fastify Integration

The logger is designed to work with Fastify's built-in Pino logger:

```typescript
// In main.ts - use fastifyLoggerConfig for Fastify
import { fastifyLoggerConfig } from '@app/utils';

const app = Fastify({
    logger: fastifyLoggerConfig,
    genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
    requestIdLogLabel: 'traceId',
});

// Access logger via app.log or request.log
app.log.info('Server started');
request.log.info({ userId }, 'User action'); // Includes traceId automatically
```

### Standalone Logger

For code outside of request context (startup, background jobs):

```typescript
import { logger } from '@app/utils';

logger.info({ event: 'startup' }, 'Application starting');
```

### Route Logging Filter

Skip automatic logging for specific routes:

```typescript
import { skipRouteLogging } from '@app/utils';

// Silences logs for /graphql, /health, /ready, /live
app.addHook('onRequest', skipRouteLogging);
```

## Configuration

```typescript
import { env } from '@app/utils';

// All environment variables are validated at startup
console.log(env.DATABASE_URL);
console.log(env.PORT);
console.log(env.isDevelopment); // Computed property
```

## Health Checks

```typescript
import { registerHealthCheck, runHealthChecks } from '@app/utils';

// Register custom health checks
registerHealthCheck('redis', async () => ({
    healthy: true,
    latencyMs: 5,
}));

// Run all checks
const results = await runHealthChecks();
```

## Error Handling

```typescript
import { errorHandler, NotFoundError, ValidationError } from '@app/utils';

// Throw typed errors
throw new NotFoundError('User not found');
throw new ValidationError('Invalid email format');

// Use centralized error handler
app.setErrorHandler((error, request, reply) => {
    errorHandler(error, request, reply);
});
```

## Building

Run `nx build utils` to build the library.

## Running unit tests

Run `nx test utils` to execute the unit tests via [Jest](https://jestjs.io).
