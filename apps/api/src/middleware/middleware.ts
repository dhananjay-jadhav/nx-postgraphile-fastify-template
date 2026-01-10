import { errorHandler, gqlLogger, NotFoundError } from '@app/utils';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { join } from 'path';

/**
 * Registers Fastify plugins:
 * 1. Security headers (helmet)
 * 2. Response compression (gzip/brotli)
 * 3. Request logging
 * 4. Static file serving
 */
export async function registerPlugins(app: FastifyInstance): Promise<void> {
    // Security headers
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: false, // Disabled for GraphiQL
        crossOriginEmbedderPolicy: false,
    });

    // Response compression (gzip)
    await app.register(fastifyCompress);

    // Request logging hook
    app.addHook('onRequest', gqlLogger);

    // Static files with caching
    await app.register(fastifyStatic, {
        root: join(__dirname, '..', 'assets'),
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
    app.setErrorHandler((error, request, reply) => {
        errorHandler(error, request, reply);
    });
}
