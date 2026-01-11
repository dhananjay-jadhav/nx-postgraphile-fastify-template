/**
 * WrapPlan: user Query
 *
 * Intercepts Query.user - fetches single User by rowId.
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import type { ExecutableStep, FieldArgs, FieldInfo } from 'grafast';
import { sideEffect } from 'grafast';
import type { User } from '@app/gql';
import { logger } from '@app/utils';

/**
 * WrapPlan function type for Query.user
 */
export type UserQueryWrapPlanFn = typeof userQueryWrapPlan;

/**
 * WrapPlan for Query.user
 *
 * @param plan - Function to call the original plan resolver
 * @param $source - The parent step (Query root)
 * @param fieldArgs - Access arguments via fieldArgs.getRaw('argName') or destructure { $rowId }
 * @param info - Field metadata (rarely needed)
 * @returns ExecutableStep for the field result
 *
 * @example
 * ```typescript
 * // apps/api/src/server/graphile.config.ts
 * import { wrapPlans } from 'postgraphile/utils';
 * import { userQueryWrapPlan } from '@app/users-api';
 *
 * const MyWrapPlansPlugin = wrapPlans({
 *     Query: {
 *         user: userQueryWrapPlan,
 *     },
 * });
 *
 * // Add to preset: plugins: [MyWrapPlansPlugin]
 * ```
 */
export function userQueryWrapPlan(
    plan: () => ExecutableStep<User | null>,
    $source: ExecutableStep,
    fieldArgs: FieldArgs,
    info: FieldInfo
): ExecutableStep<User | null> {
    // Get the rowId argument
    const $rowId = fieldArgs.getRaw('rowId');

    // Log when this wrapPlan is invoked (runs during execution, not planning)
    sideEffect($rowId, (rowId) => {
        logger.debug({ wrapPlan: 'Query.user', rowId }, 'WrapPlan invoked');
    });

    // Call original plan and return result
    return plan();
}
