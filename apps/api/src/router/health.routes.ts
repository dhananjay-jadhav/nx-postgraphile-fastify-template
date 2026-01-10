/**
 * Health Check Routes
 * Provides Kubernetes-compatible health endpoints for container orchestration
 */
import { getPoolStats } from '@app/database';
import { livenessCheck, logger, readinessCheck, runHealthChecks } from '@app/utils';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function registerHealthRoutes(app: FastifyInstance): void {
    /**
     * Liveness probe - confirms the process is running
     * Used by Kubernetes to determine if container needs restart
     */
    app.get('/live', async (_request: FastifyRequest, reply: FastifyReply) => {
        return reply.status(200).send(livenessCheck());
    });

    /**
     * Health check - comprehensive health report
     * Returns detailed status of all system components
     */
    app.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
        const report = await runHealthChecks();
        const poolStats = getPoolStats();
        return reply.status(report.status === 'unhealthy' ? 503 : 200).send({ ...report, pool: poolStats });
    });

    /**
     * Readiness probe - confirms all components are ready to serve traffic
     * Used by Kubernetes to determine if pod should receive traffic
     */
    app.get('/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await readinessCheck();
            if (result.ready) {
                return reply.status(200).send({ status: 'ready' });
            } else {
                return reply.status(503).send({ status: 'not ready', unhealthyComponents: result.components });
            }
        } catch (error) {
            logger.error({ error }, 'Readiness check failed');
            return reply.status(503).send({ status: 'error', message: 'Readiness check failed' });
        }
    });
}
