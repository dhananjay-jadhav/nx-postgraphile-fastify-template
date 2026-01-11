import { FastifyInstance } from 'fastify';
import { grafserv } from 'grafserv/fastify/v4';
import { postgraphile, PostGraphileInstance } from 'postgraphile';

import { preset } from './graphile.config.js';

/**
 * Initializes and mounts the PostGraphile GraphQL server.
 *
 * Query validation (depth/cost limits) is handled by QueryValidationPlugin
 * which hooks into grafast's middleware after parsing, avoiding double-parse.
 *
 * @throws Error if GraphQL server fails to initialize
 */
export async function setupGraphQL(app: FastifyInstance): Promise<PostGraphileInstance> {
    const pgl = postgraphile(preset);
    const serv = pgl.createServ(grafserv);

    await serv.addTo(app);

    return pgl;
}
