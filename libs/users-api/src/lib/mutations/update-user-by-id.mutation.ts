/**
 * WrapPlan: updateUserById Mutation
 *
 * Intercepts Mutation.updateUserById - updates User by global ID.
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import type { UpdateUserPayload } from '@app/gql';
import { logger } from '@app/utils';
import type { ExecutableStep, FieldArgs, FieldInfo } from 'grafast';
import { sideEffect } from 'grafast';

/**
 * WrapPlan function type for Mutation.updateUserById
 */
export type UpdateUserByIdWrapPlanFn = typeof updateUserByIdWrapPlan;

/**
 * WrapPlan for Mutation.updateUserById
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
 * import { updateUserByIdWrapPlan } from '@app/users-api';
 *
 * const MyWrapPlansPlugin = wrapPlans({
 *     Mutation: {
 *         updateUserById: updateUserByIdWrapPlan,
 *     },
 * });
 *
 * // Add to preset: plugins: [MyWrapPlansPlugin]
 * ```
 */
export function updateUserByIdWrapPlan(
    plan: () => ExecutableStep<UpdateUserPayload | null>,
    $source: ExecutableStep,
    fieldArgs: FieldArgs,
    info: FieldInfo
): ExecutableStep<UpdateUserPayload | null> {
    // Get input argument
    const $input = fieldArgs.getRaw('input');

    // Log when this wrapPlan is invoked
    sideEffect($input, (input) => {
        logger.debug({ wrapPlan: 'Mutation.updateUserById', hasInput: !!input }, 'WrapPlan invoked');
    });

    // Call original plan and return result
    return plan();
}
