import { getPool } from '@app/database';
import { env, fastifyLoggerConfig } from '@app/utils';
import Fastify, { FastifyInstance } from 'fastify';

import { registerPlugins, setErrorHandler } from './middleware';
import { registerRoutes } from './router';
import { setupGracefulShutdown, setupGraphQL } from './server';

// ============================================================================
// Server Initialization
// ============================================================================

async function startServer(): Promise<void> {
    // Create Fastify app with built-in Pino logger
    const app: FastifyInstance = Fastify({
        logger: fastifyLoggerConfig,
        trustProxy: true,
        // Generate request ID from header or create new UUID
        genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),
        requestIdHeader: 'x-request-id',
        // Use 'traceId' instead of default 'reqId' in logs
        requestIdLogLabel: 'traceId',
        keepAliveTimeout: env.KEEP_ALIVE_TIMEOUT ?? 65000,
    });

    // Initialize database connection
    getPool();

    // Register plugins (compression, helmet, static files)
    await registerPlugins(app);

    // Register application routes (health, api)
    await registerRoutes(app);

    // Setup GraphQL server
    const pgl = await setupGraphQL(app);

    // Setup error handler
    setErrorHandler(app);

    // Setup graceful shutdown handlers
    setupGracefulShutdown(app, pgl);

    // Start listening
    try {
        await app.listen({ port: env.PORT, host: '0.0.0.0' });
        app.log.info({ port: env.PORT, env: env.NODE_ENV }, `${env.APP_NAME} listening at http://localhost:${env.PORT}`);
        app.log.info({ port: env.PORT }, `GraphQL available at http://localhost:${env.PORT}/graphql`);
    } catch (error) {
        app.log.error({ error }, 'Server error');
        process.exit(1);
    }
}

// ============================================================================
// Entry Point
// ============================================================================

startServer().catch((error: Error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
