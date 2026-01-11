/**
 * WrapPlan: createUser Mutation
 *
 * Intercepts Mutation.createUser - creates a new User record.
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import type { CreateUserPayload } from '@app/gql';
import { logger } from '@app/utils';
import type { ExecutableStep, FieldArgs, FieldInfo } from 'grafast';
import { sideEffect } from 'grafast';

/**
 * WrapPlan function type for Mutation.createUser
 */
export type CreateUserWrapPlanFn = typeof createUserWrapPlan;

/**
 * WrapPlan for Mutation.createUser
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
 * import { sideEffect, context } from 'grafast';
 * import { createUserWrapPlan } from '@app/users-api';
 *
 * const MyWrapPlansPlugin = wrapPlans({
 *     Mutation: {
 *         createUser: createUserWrapPlan,
 *     },
 * });
 *
 * // Add to preset: plugins: [MyWrapPlansPlugin]
 * ```
 */
export function createUserWrapPlan(
    plan: () => ExecutableStep<CreateUserPayload | null>,
    $source: ExecutableStep,
    fieldArgs: FieldArgs,
    info: FieldInfo
): ExecutableStep<CreateUserPayload | null> {
    // Get input argument
    const $input = fieldArgs.getRaw('input');

    // Log when this wrapPlan is invoked
    sideEffect($input, (input) => {
        logger.debug({ wrapPlan: 'Mutation.createUser', hasInput: !!input }, 'WrapPlan invoked');
    });

    // Call original plan and return result
    return plan();
}
