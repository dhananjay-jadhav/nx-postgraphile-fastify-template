/**
 * WrapPlan: users Connection Query
 *
 * Intercepts Query.users - fetches paginated list of User records.
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import type { ExecutableStep, FieldArgs, FieldInfo } from 'grafast';
import { sideEffect } from 'grafast';
import type { UserConnection } from '@app/gql';
import { logger } from '@app/utils';

/**
 * WrapPlan function type for Query.users
 */
export type UsersConnectionWrapPlanFn = typeof usersConnectionWrapPlan;

/**
 * WrapPlan for Query.users
 *
 * @param plan - Function to call the original plan resolver
 * @param $source - The parent step (Query root)
 * @param fieldArgs - Access arguments via fieldArgs.getRaw('first'), etc.
 * @param info - Field metadata (rarely needed)
 * @returns ExecutableStep for the connection result
 *
 * @example
 * ```typescript
 * // apps/api/src/server/graphile.config.ts
 * import { wrapPlans } from 'postgraphile/utils';
 * import { usersConnectionWrapPlan } from '@app/users-api';
 *
 * const MyWrapPlansPlugin = wrapPlans({
 *     Query: {
 *         users: usersConnectionWrapPlan,
 *     },
 * });
 *
 * // Add to preset: plugins: [MyWrapPlansPlugin]
 * ```
 */
export function usersConnectionWrapPlan(
    plan: () => ExecutableStep<UserConnection | null>,
    $source: ExecutableStep,
    fieldArgs: FieldArgs,
    info: FieldInfo
): ExecutableStep<UserConnection | null> {
    // Get pagination arguments
    const $first = fieldArgs.getRaw('first');

    // Log when this wrapPlan is invoked
    sideEffect($first, (first) => {
        logger.debug({ wrapPlan: 'Query.users', first }, 'WrapPlan invoked');
    });

    // Call original plan and return result
    return plan();
}
