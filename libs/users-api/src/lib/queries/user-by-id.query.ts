/**
 * WrapPlan: userById Query
 *
 * Intercepts Query.userById - fetches single User by global ID.
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import type { User } from '@app/gql';
import { logger } from '@app/utils';
import type { ExecutableStep, FieldArgs, FieldInfo } from 'grafast';
import { sideEffect } from 'grafast';

/**
 * WrapPlan function type for Query.userById
 */
export type UserByIdQueryWrapPlanFn = typeof userByIdQueryWrapPlan;

/**
 * WrapPlan for Query.userById
 *
 * @param plan - Function to call the original plan resolver
 * @param $source - The parent step (Query root)
 * @param fieldArgs - Access arguments via fieldArgs.getRaw('id') or destructure { $id }
 * @param info - Field metadata (rarely needed)
 * @returns ExecutableStep for the field result
 *
 * @example
 * ```typescript
 * // apps/api/src/server/graphile.config.ts
 * import { wrapPlans } from 'postgraphile/utils';
 * import { userByIdQueryWrapPlan } from '@app/users-api';
 *
 * const MyWrapPlansPlugin = wrapPlans({
 *     Query: {
 *         userById: userByIdQueryWrapPlan,
 *     },
 * });
 *
 * // Add to preset: plugins: [MyWrapPlansPlugin]
 * ```
 */
export function userByIdQueryWrapPlan(
    plan: () => ExecutableStep<User | null>,
    $source: ExecutableStep,
    fieldArgs: FieldArgs,
    info: FieldInfo
): ExecutableStep<User | null> {
    // Get the id argument (global Node ID)
    const $id = fieldArgs.getRaw('id');

    // Log when this wrapPlan is invoked
    sideEffect($id, (id) => {
        logger.debug({ wrapPlan: 'Query.userById', id }, 'WrapPlan invoked');
    });

    // Call original plan and return result
    return plan();
}
