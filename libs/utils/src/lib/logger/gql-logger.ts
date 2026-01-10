import { FastifyReply, FastifyRequest } from 'fastify';

import { env } from '../config/config';
import { logger } from './logger';

interface GraphQLBody {
    operationName?: string;
}

const getGraphQLOperationName = (req: FastifyRequest): string | undefined => {
    const body = req.body as GraphQLBody | undefined;
    const query = req.query as { operationName?: string } | undefined;
    return body?.operationName || query?.operationName;
};

const isGraphQLRequest = (req: FastifyRequest): boolean => {
    const url = req.url || '';
    return url.includes('/graphql') || url.includes('/graphiql');
};

const shouldSkipLogging = (req: FastifyRequest): boolean => {
    const url = req.url || '';
    return url.includes('/health') || url.includes('/ready') || url.includes('/live');
};

/**
 * Fastify request logging hook
 * Attaches logger to request and logs request completion
 */
export const gqlLogger = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Generate request ID
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    req.id = requestId;

    // Attach child logger with request context
    const reqLogger = logger.child({
        requestId,
        ...(isGraphQLRequest(req) && {
            graphql: { operationName: getGraphQLOperationName(req) },
        }),
        ...(!env.isDevelopment && {
            userAgent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.ip,
        }),
    });

    // Attach logger to request
    req.log = reqLogger;

    // Log response on finish
    reply.raw.on('finish', () => {
        if (shouldSkipLogging(req)) return;

        const statusCode = reply.statusCode;
        const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

        const logData = {
            req: {
                method: req.method,
                url: req.url,
                query: req.query,
            },
            res: {
                statusCode,
            },
        };

        let message: string;
        if (isGraphQLRequest(req)) {
            const op = getGraphQLOperationName(req);
            message = op ? `GraphQL ${op} completed` : `GraphQL request completed`;
        } else {
            message = `${req.method} ${req.url} ${statusCode}`;
        }

        reqLogger[logLevel](logData, message);
    });
};
