/**
 * WrapPlan: deleteUser Mutation
 *
 * Intercepts Mutation.deleteUser - deletes User by rowId.
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import type { ExecutableStep, FieldArgs, FieldInfo } from 'grafast';
import { sideEffect } from 'grafast';
import type { DeleteUserPayload } from '@app/gql';
import { logger } from '@app/utils';

/**
 * WrapPlan function type for Mutation.deleteUser
 */
export type DeleteUserWrapPlanFn = typeof deleteUserWrapPlan;

/**
 * WrapPlan for Mutation.deleteUser
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
 * import { deleteUserWrapPlan } from '@app/users-api';
 *
 * const MyWrapPlansPlugin = wrapPlans({
 *     Mutation: {
 *         deleteUser: deleteUserWrapPlan,
 *     },
 * });
 *
 * // Add to preset: plugins: [MyWrapPlansPlugin]
 * ```
 */
export function deleteUserWrapPlan(
    plan: () => ExecutableStep<DeleteUserPayload | null>,
    $source: ExecutableStep,
    fieldArgs: FieldArgs,
    info: FieldInfo
): ExecutableStep<DeleteUserPayload | null> {
    // Get input argument
    const $input = fieldArgs.getRaw('input');

    // Log when this wrapPlan is invoked
    sideEffect($input, (input) => {
        logger.debug({ wrapPlan: 'Mutation.deleteUser', hasInput: !!input }, 'WrapPlan invoked');
    });

    // Call original plan and return result
    return plan();
}
