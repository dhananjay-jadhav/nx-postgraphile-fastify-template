/**
 * GraphQL Logging Plugin
 *
 * Integrates pino logger with PostGraphile/Grafast to provide:
 * - Trace ID per request (from x-request-id header or auto-generated)
 * - Automatic timing of GraphQL operations
 * - Structured logging with operation metadata
 *
 * @see https://grafast.org/grafast/middleware
 */
// Import type augmentation from grafserv/fastify/v4 to get proper RequestContext types
import 'grafserv/fastify/v4';

import { logger as rootLogger } from '@app/utils';
import type { FastifyBaseLogger, FastifyRequest } from 'fastify';
import type { Context } from 'grafast';
import type { DefinitionNode, DocumentNode, OperationDefinitionNode } from 'graphql';

// Module augmentation for Grafast context
declare module 'grafast' {
    interface Context {
        /** Request trace ID for correlation */
        traceId: string;
        /** Fastify logger with request context */
        logger: FastifyBaseLogger;
        /** Request start time for timing */
        _startTime: number;
        /** GraphQL operation name */
        _operationName?: string;
        /** GraphQL operation type (query/mutation/subscription) */
        _operationType?: string;
    }
}

/** Operation details extracted from GraphQL document */
interface OperationDetails {
    name: string;
    type: string;
}

/**
 * Type guard to check if a definition is an OperationDefinitionNode
 */
function isOperationDefinition(def: DefinitionNode): def is OperationDefinitionNode {
    return def.kind === 'OperationDefinition';
}

/**
 * Extract operation details from GraphQL document
 */
function getOperationDetails(document: DocumentNode | null | undefined, operationName?: string | null): OperationDetails {
    if (!document?.definitions) {
        return { name: operationName ?? 'unknown', type: 'unknown' };
    }

    const operations = document.definitions.filter(isOperationDefinition);

    if (operations.length === 0) {
        return { name: operationName ?? 'unknown', type: 'unknown' };
    }

    // If operationName provided, find matching operation
    if (operationName) {
        const op = operations.find((o) => o.name?.value === operationName);
        if (op) {
            return { name: operationName, type: op.operation };
        }
    }

    // Otherwise use first operation
    const firstOp = operations[0];
    return {
        name: firstOp.name?.value ?? 'anonymous',
        type: firstOp.operation ?? 'unknown',
    };
}

/**
 * GraphQL Logging Plugin
 *
 * Provides request tracing and operation timing for all GraphQL operations.
 *
 * @example
 * ```typescript
 * // apps/api/src/server/graphile.config.ts
 * import { LoggingPlugin } from '@app/gql';
 *
 * export const preset: GraphileConfig.Preset = {
 *     plugins: [LoggingPlugin],
 *     // ... other config
 * };
 * ```
 */
export const LoggingPlugin: GraphileConfig.Plugin = {
    name: 'LoggingPlugin',
    version: '1.0.0',
    description: 'Adds request tracing and operation timing to GraphQL operations',

    grafast: {
        middleware: {
            /**
             * prepareArgs - Inject traceId and logger into context
             * Runs before execution, sets up request context
             */
            prepareArgs(next, event) {
                const { args } = event;
                const { requestContext, contextValue, operationName, document } = args;

                // Get Fastify request from grafserv context (typed via grafserv/fastify/v4)
                // Note: grafserv adapter is named 'fastifyv4' regardless of actual Fastify version (4.x or 5.x)
                const fastifyRequest: FastifyRequest | undefined =
                    requestContext?.fastifyv4?.request;

                // Get traceId - Fastify's genReqId sets this from x-request-id header or UUID
                const traceId =
                    fastifyRequest?.id?.toString() ??
                    requestContext?.http?.getHeader?.('x-request-id') ??
                    crypto.randomUUID();

                // Get operation details
                const { name, type } = getOperationDetails(document, operationName);

                // Reuse Fastify's built-in Pino logger (already has traceId bound)
                // Falls back to standalone logger for non-HTTP contexts (e.g., subscriptions)
                const baseLogger = fastifyRequest?.log ?? rootLogger;
                const childLogger = baseLogger.child({
                    graphql: {
                        operation: name,
                        type,
                    },
                });

                // Inject into context
                const ctx = contextValue as Context;
                ctx.traceId = traceId;
                ctx.logger = childLogger;
                ctx._startTime = performance.now();
                ctx._operationName = name;
                ctx._operationType = type;

                // Log operation start at debug level
                childLogger.debug(
                    {
                        variables: args.variableValues,
                    },
                    `GraphQL ${type} ${name} started`
                );

                return next();
            },

            /**
             * execute - Wrap execution to measure timing and log completion
             * Runs around the actual GraphQL execution
             */
            async execute(next, event) {
                const { args } = event;
                const ctx = args.contextValue as Context;

                const startTime = ctx._startTime ?? performance.now();
                const operationName = ctx._operationName ?? 'unknown';
                const operationType = ctx._operationType ?? 'unknown';
                const logger = ctx.logger ?? rootLogger;

                try {
                    // Execute the GraphQL operation
                    const result = await next();

                    // Calculate duration
                    const duration = performance.now() - startTime;
                    const durationMs = Math.round(duration * 100) / 100;

                    // Check for errors in result
                    const errors =
                        result &&
                        typeof result === 'object' &&
                        'errors' in result &&
                        Array.isArray(result.errors)
                            ? (result.errors as Array<{ message?: string; path?: readonly (string | number)[] }>)
                            : [];
                    const hasErrors = errors.length > 0;

                    // Log completion with timing
                    if (hasErrors) {
                        logger.warn(
                            {
                                durationMs,
                                errors: errors.map((e) => ({
                                    message: e.message,
                                    path: e.path,
                                })),
                            },
                            `GraphQL ${operationType} ${operationName} completed with errors in ${durationMs}ms`
                        );
                    } else {
                        logger.info(
                            { durationMs },
                            `GraphQL ${operationType} ${operationName} completed in ${durationMs}ms`
                        );
                    }

                    return result;
                } catch (error) {
                    // Calculate duration even on error
                    const duration = performance.now() - startTime;
                    const durationMs = Math.round(duration * 100) / 100;

                    logger.error(
                        {
                            durationMs,
                            error:
                                error instanceof Error
                                    ? { message: error.message, stack: error.stack }
                                    : error,
                        },
                        `GraphQL ${operationType} ${operationName} failed after ${durationMs}ms`
                    );

                    throw error;
                }
            },
        },
    },
};

export default LoggingPlugin;
