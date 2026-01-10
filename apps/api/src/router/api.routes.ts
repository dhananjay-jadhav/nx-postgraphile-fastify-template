import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export async function registerApiRoutes(app: FastifyInstance): Promise<void> {
    /**
     * Base API endpoint - returns welcome message
     */
    app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        request.log.info('Processing API request');
        return reply.send({ message: 'Welcome to api!' });
    });
}
