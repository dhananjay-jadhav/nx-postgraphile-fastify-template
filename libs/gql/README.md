# @app/gql

GraphQL types, plugins, and utilities for PostGraphile.

## Features

- **LoggingPlugin** - Automatic request tracing with timing for all GraphQL operations
- **TypeScript Types** - Generated types from GraphQL schema via codegen
- **Wrap Plan Types** - Type definitions for PostGraphile wrapPlan functions

## Usage

```typescript
import { LoggingPlugin } from '@app/gql';
import type { WrapPlanContext } from '@app/gql';
```

## LoggingPlugin

The logging plugin provides:

- **Trace ID** - Correlates all logs for a single request (from `x-request-id` header or auto-generated)
- **Operation Timing** - Measures execution time for queries and mutations
- **Structured Logging** - JSON logs with operation name, type, duration, and errors

### Accessing Logger in Resolvers

Use grafast's `context()` to access the logger in wrapPlan functions:

```typescript
import { context, sideEffect } from 'grafast';

// In a wrapPlan function
const $ctx = context();
const $logger = $ctx.get('logger');

sideEffect($logger, (logger) => {
    logger.info({ customData: 'value' }, 'Custom log message');
});
```

### Log Output Example

```json
{
    "level": "info",
    "time": "2026-01-11T10:30:00.000Z",
    "traceId": "abc-123-def-456",
    "graphql": { "operation": "GetUser", "type": "query" },
    "durationMs": 12.5,
    "msg": "GraphQL query GetUser completed in 12.5ms"
}
```

## Building

Run `nx build gql` to build the library.

## Running unit tests

Run `nx test gql` to execute the unit tests via [Jest](https://jestjs.io).
