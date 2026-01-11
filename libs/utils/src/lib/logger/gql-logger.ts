/**
 * Route Logging Filter
 *
 * Conditionally skips Fastify's automatic request logging for specific routes.
 * This reduces log noise for high-frequency or specially-handled endpoints.
 *
 * @module
 */
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

/**
 * Routes to skip from Fastify's automatic request logging:
 * - GraphQL: LoggingPlugin handles with operation details and timing
 * - Health endpoints: High-frequency probes we don't need to log
 *
 * @see libs/gql/src/lib/plugins/logging.plugin.ts for GraphQL operation logging
 */
const SKIP_LOGGING_PATTERNS = ['/graphql', '/graphiql', '/health', '/ready', '/live'];

const shouldSkipLogging = (url: string): boolean => SKIP_LOGGING_PATTERNS.some((pattern) => url.includes(pattern));

/**
 * Fastify hook to conditionally skip automatic request logging.
 *
 * Fastify's built-in Pino logger automatically logs all requests.
 * This hook disables logging for specific routes by setting req.log.level.
 *
 * Usage: app.addHook('onRequest', skipRouteLogging);
 */
export const skipRouteLogging = (req: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction): void => {
    if (shouldSkipLogging(req.url || '')) {
        // Suppress automatic request logging for this request
        // The 'silent' level prevents Fastify from logging request/response
        req.log = req.log.child({}, { level: 'silent' });
    }
    done();
};
