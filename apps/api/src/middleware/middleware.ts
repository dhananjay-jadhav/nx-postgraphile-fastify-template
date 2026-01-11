import { join } from 'node:path';

import { env, errorHandler, NotFoundError, skipRouteLogging } from '@app/utils';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Registers Fastify plugins:
 * 1. Rate limiting
 * 2. Security headers (helmet)
 * 3. Response compression (gzip/brotli)
 * 4. Skip logging for GraphQL/health routes
 * 5. Static file serving
 *
 * Note: Request logging is handled by Fastify's built-in Pino logger.
 * GraphQL operation logging with timing is handled by LoggingPlugin.
 */
export async function registerPlugins(app: FastifyInstance): Promise<void> {
    // Rate limiting - protect against abuse
    await app.register(fastifyRateLimit, {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
        // Skip rate limiting for health checks
        allowList: (req) => {
            const path = req.url || '';
            return path === '/live' || path === '/ready' || path === '/health';
        },
        // Custom error response
        errorResponseBuilder: (_req, context) => ({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
                retryAfter: Math.ceil(context.ttl / 1000),
            },
        }),
    });

    // Security headers
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: false, // Disabled for GraphiQL
        crossOriginEmbedderPolicy: false,
    });

    // Response compression (gzip)
    await app.register(fastifyCompress);

    // Skip automatic logging for GraphQL and health routes
    // GraphQL: LoggingPlugin handles with detailed timing
    // Health: High-frequency, low-value logs
    app.addHook('onRequest', skipRouteLogging);

    // Static files with caching
    await app.register(fastifyStatic, {
        root: join(__dirname, 'assets'),
        prefix: '/assets/',
        maxAge: '1d',
        etag: true,
    });
}

/**
 * Sets up error handling for Fastify:
 * 1. 404 handler for unknown routes
 * 2. Global error handler
 */
export function setErrorHandler(app: FastifyInstance): void {
    // 404 handler for unknown routes
    app.setNotFoundHandler((_request: FastifyRequest, reply: FastifyReply) => {
        errorHandler(new NotFoundError('Route not found'), _request, reply);
    });

    // Global error handler
    app.setErrorHandler((error: Error, request, reply) => {
        errorHandler(error, request, reply);
    });
}
