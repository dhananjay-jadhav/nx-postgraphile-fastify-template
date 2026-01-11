import type { FastifyServerOptions } from 'fastify';
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

/**
 * Pino logger options - used by both standalone logger and Fastify
 */
export const pinoOptions: pino.LoggerOptions = {
    level: logLevel,
    formatters: {
        level: (label: string): { level: string } => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        env: process.env.NODE_ENV || 'development',
    },
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        censor: '[REDACTED]',
    },
};

/**
 * Fastify logger configuration
 * Use this in Fastify({ logger: fastifyLoggerConfig })
 */
export const fastifyLoggerConfig: FastifyServerOptions['logger'] = {
    ...pinoOptions,
    serializers: {
        req(request) {
            return {
                method: request.method,
                url: request.url,
                hostname: request.hostname,
                // Don't log headers in production (sensitive data)
                ...(isProduction ? {} : { headers: request.headers }),
            };
        },
        res(reply) {
            return {
                statusCode: reply.statusCode,
            };
        },
    },
};

/**
 * Standalone pino logger for use outside of request context
 * (e.g., startup logs, background jobs, database initialization)
 */
export const logger = pino(pinoOptions);
