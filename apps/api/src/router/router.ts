/**
 * Main Application Router
 * Registers all route modules under their respective paths
 */
import type { FastifyInstance } from 'fastify';

import { registerApiRoutes } from './api.routes';
import { registerHealthRoutes } from './health.routes';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
    // Health check routes (/, /live, /ready, /health)
    await registerHealthRoutes(app);

    // API routes (/api/*)
    await app.register(registerApiRoutes, { prefix: '/api' });
}
