import { preset } from '@app/gql';
import { logger } from '@app/utils';
import { FastifyInstance } from 'fastify';
import { grafserv } from 'grafserv/fastify/v4';
import { postgraphile, PostGraphileInstance } from 'postgraphile';

/**
 * Initializes and mounts the PostGraphile GraphQL server.
 * @throws Error if GraphQL server fails to initialize
 */
export async function setupGraphQL(app: FastifyInstance): Promise<PostGraphileInstance> {
    try {
        const pgl = postgraphile(preset);
        const serv = pgl.createServ(grafserv);

        await serv.addTo(app);

        logger.info('GraphQL server initialized');

        return pgl;
    } catch (error) {
        logger.error({ error }, 'Failed to initialize GraphQL server');
        throw error;
    }
}
