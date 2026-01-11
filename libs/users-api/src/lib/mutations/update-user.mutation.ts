/**
 * WrapPlan: updateUser Mutation
 *
 * Intercepts Mutation.updateUser - updates User by rowId.
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import type { ExecutableStep, FieldArgs, FieldInfo } from 'grafast';
import { sideEffect } from 'grafast';
import type { UpdateUserPayload } from '@app/gql';
import { logger } from '@app/utils';

/**
 * WrapPlan function type for Mutation.updateUser
 */
export type UpdateUserWrapPlanFn = typeof updateUserWrapPlan;

/**
 * WrapPlan for Mutation.updateUser
 *
 * @param plan - Function to call the original plan resolver
 * @param $source - The parent step (Mutation root)
 * @param fieldArgs - Access arguments via fieldArgs.getRaw('input') or destructure { $input }
 * @param info - Field metadata (rarely needed)
 * @returns ExecutableStep for the mutation payload
 *
 * @example
 * ```typescript
 * // apps/api/src/server/graphile.config.ts
 * import { wrapPlans } from 'postgraphile/utils';
 * import { updateUserWrapPlan } from '@app/users-api';
 *
 * const MyWrapPlansPlugin = wrapPlans({
 *     Mutation: {
 *         updateUser: updateUserWrapPlan,
 *     },
 * });
 *
 * // Add to preset: plugins: [MyWrapPlansPlugin]
 * ```
 */
export function updateUserWrapPlan(
    plan: () => ExecutableStep<UpdateUserPayload | null>,
    $source: ExecutableStep,
    fieldArgs: FieldArgs,
    info: FieldInfo
): ExecutableStep<UpdateUserPayload | null> {
    // Get input argument
    const $input = fieldArgs.getRaw('input');

    // Log when this wrapPlan is invoked
    sideEffect($input, (input) => {
        logger.debug({ wrapPlan: 'Mutation.updateUser', hasInput: !!input }, 'WrapPlan invoked');
    });

    // Call original plan and return result
    return plan();
}
