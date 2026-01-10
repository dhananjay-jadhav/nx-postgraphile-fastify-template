import { getPool } from '@app/database';
import { env, logger } from '@app/utils';
import Fastify, { FastifyInstance } from 'fastify';

import { registerPlugins, setErrorHandler } from './middleware';
import { registerRoutes } from './router';
import { setupGracefulShutdown, setupGraphQL } from './server';

// ============================================================================
// Server Initialization
// ============================================================================

async function startServer(): Promise<void> {
    // Create Fastify app
    const app: FastifyInstance = Fastify({
        logger: false, // We use our own pino logger
        trustProxy: true,
    });

    // Initialize database connection
    getPool();
    logger.info('Database pool initialized');

    // Register plugins (compression, helmet, static files, logging)
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
        logger.info({ port: env.PORT, env: env.NODE_ENV }, `${env.APP_NAME} listening at http://localhost:${env.PORT}`);
        logger.info({ port: env.PORT }, `GraphQL available at http://localhost:${env.PORT}/graphql`);
    } catch (error) {
        logger.error({ error }, 'Server error');
        process.exit(1);
    }
}

// ============================================================================
// Entry Point
// ============================================================================

startServer().catch((error: Error) => {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
});
