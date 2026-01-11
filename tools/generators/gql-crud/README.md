# GQL CRUD Generator

Generate a new wrapPlans API library for a GraphQL type with properly typed functions.

## Usage

```bash
# Generate library with default naming ({typePlural}-api)
npm run gen:gql-crud User        # Creates libs/users-api/

# Generate library with custom name
npm run gen:gql-crud User --name users    # Creates libs/users/
```

## What It Creates

```
libs/{libName}/
  src/
    index.ts                              # Exports plugin & all wrapPlans
    lib/
      queries/
        {type}.query.ts                   # Single item by rowId
        {type}-by-id.query.ts             # Single item by global ID
        {typePlural}.query.ts             # Paginated list (connection)
      mutations/
        create-{type}.mutation.ts         # Create mutation
        update-{type}.mutation.ts         # Update by rowId
        update-{type}-by-id.mutation.ts   # Update by global ID
        delete-{type}.mutation.ts         # Delete by rowId
        delete-{type}-by-id.mutation.ts   # Delete by global ID
```

## Generated WrapPlans

### Query WrapPlans
- `{typeName}QueryWrapPlan` - Single item by rowId
- `{typeName}ByIdQueryWrapPlan` - Single item by global ID  
- `{typeNamePlural}ConnectionWrapPlan` - Paginated list

### Mutation WrapPlans
- `create{TypeName}WrapPlan` - Create mutation
- `update{TypeName}WrapPlan` - Update by rowId
- `update{TypeName}ByIdWrapPlan` - Update by global ID
- `delete{TypeName}WrapPlan` - Delete by rowId
- `delete{TypeName}ByIdWrapPlan` - Delete by global ID

## Auto-Import

The generator automatically updates `apps/api/src/server/graphile.config.ts`:
- Adds import statement for the generated `{TypeName}WrapPlansPlugin`
- Adds the plugin to the `plugins` array

If auto-import fails, you can manually add the configuration as shown below.

## Manual Configuration (if needed)

Add the generated plugin to your `apps/api/src/server/graphile.config.ts`:

```typescript
import { UserWrapPlansPlugin } from '@app/users-api';

export const preset: GraphileConfig.Preset = {
    plugins: [LoggingPlugin, UserWrapPlansPlugin],
    // ... existing config
};
```

The plugin is pre-configured with all wrapPlan functions. To customize behavior,
edit individual files in `libs/{libName}/src/lib/queries/` and `libs/{libName}/src/lib/mutations/`.

## Shared Types

The `WrapPlanFn` generic type is defined in `@app/gql` and can be used to type custom wrapPlans:

```typescript
import type { WrapPlanFn } from '@app/gql';

const myWrapPlan: WrapPlanFn<User | null> = (plan, $source, fieldArgs, info) => {
    // Custom logic here
    return plan(); // Call the original plan
};
```

## Templates

EJS templates are located in `files/` directory:
- `index.ts.template` - Library exports with pre-configured plugin
- `lib/queries/*.template` - Individual query wrapPlans
- `lib/mutations/*.template` - Individual mutation wrapPlans

Customize templates to change the generated code structure.
