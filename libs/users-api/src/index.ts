/**
 * User API - WrapPlans Library
 *
 * Provides typed wrapPlan functions for User queries and mutations.
 *
 * @example
 * ```typescript
 * // apps/api/src/server/graphile.config.ts
 * import { UserWrapPlansPlugin } from '@app/users-api';
 *
 * export const preset: GraphileConfig.Preset = {
 *     plugins: [LoggingPlugin, UserWrapPlansPlugin],
 *     // ...
 * };
 * ```
 *
 * @see https://grafast.org/grafast/step-library - Available step functions
 * @see https://postgraphile.org/postgraphile/next/migrating-from-v4/make-wrap-resolvers-plugin - wrapPlans docs
 */
import { wrapPlans } from 'postgraphile/utils';
import { userQueryWrapPlan } from './lib/queries/user.query.js';
import { userByIdQueryWrapPlan } from './lib/queries/user-by-id.query.js';
import { usersConnectionWrapPlan } from './lib/queries/users.query.js';
import { createUserWrapPlan } from './lib/mutations/create-user.mutation.js';
import { updateUserWrapPlan } from './lib/mutations/update-user.mutation.js';
import { updateUserByIdWrapPlan } from './lib/mutations/update-user-by-id.mutation.js';
import { deleteUserWrapPlan } from './lib/mutations/delete-user.mutation.js';
import { deleteUserByIdWrapPlan } from './lib/mutations/delete-user-by-id.mutation.js';

/**
 * User WrapPlans Plugin
 *
 * Pre-configured plugin that wraps all User CRUD operations.
 * Add custom logic in the individual wrapPlan functions for:
 * - Permission checks
 * - Input validation
 * - Audit logging
 * - Side effects (notifications, cache invalidation)
 */
export const UserWrapPlansPlugin = wrapPlans({
    Query: {
        user: userQueryWrapPlan,
        userById: userByIdQueryWrapPlan,
        users: usersConnectionWrapPlan,
    },
    Mutation: {
        createUser: createUserWrapPlan,
        updateUser: updateUserWrapPlan,
        updateUserById: updateUserByIdWrapPlan,
        deleteUser: deleteUserWrapPlan,
        deleteUserById: deleteUserByIdWrapPlan,
    },
});

// Query wrapPlans (re-export for individual use)
export { userQueryWrapPlan } from './lib/queries/user.query.js';
export { userByIdQueryWrapPlan } from './lib/queries/user-by-id.query.js';
export { usersConnectionWrapPlan } from './lib/queries/users.query.js';

// Mutation wrapPlans (re-export for individual use)
export { createUserWrapPlan } from './lib/mutations/create-user.mutation.js';
export { updateUserWrapPlan } from './lib/mutations/update-user.mutation.js';
export { updateUserByIdWrapPlan } from './lib/mutations/update-user-by-id.mutation.js';
export { deleteUserWrapPlan } from './lib/mutations/delete-user.mutation.js';
export { deleteUserByIdWrapPlan } from './lib/mutations/delete-user-by-id.mutation.js';
