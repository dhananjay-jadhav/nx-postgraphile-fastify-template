import {
    Tree,
    formatFiles,
    generateFiles,
    names,
    joinPathFragments,
    readJson,
    updateJson,
    installPackagesTask,
} from '@nx/devkit';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface GqlCrudGeneratorSchema {
    typeName: string;
    name?: string;
    directory?: string;
}

/**
 * Simple pluralize function
 */
function pluralize(word: string): string {
    if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2])) {
        return word.slice(0, -1) + 'ies';
    }
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
        word.endsWith('ch') || word.endsWith('sh')) {
        return word + 'es';
    }
    return word + 's';
}

/**
 * Validate that the type exists in generated types
 */
function validateTypeExists(tree: Tree, typeName: string): void {
    const generatedTypesPath = 'libs/gql/src/lib/generated/types.ts';
    
    if (!tree.exists(generatedTypesPath)) {
        throw new Error(
            `Generated types file not found at ${generatedTypesPath}. Run "yarn codegen" first.`
        );
    }
    
    const content = tree.read(generatedTypesPath, 'utf-8');
    if (!content?.includes(`export interface ${typeName} `)) {
        throw new Error(
            `Type "${typeName}" not found in generated types. Make sure the type exists in your schema and run "yarn codegen".`
        );
    }
}

export default async function gqlCrudGenerator(tree: Tree, options: GqlCrudGeneratorSchema) {
    const { typeName } = options;
    
    // Validate type exists
    validateTypeExists(tree, typeName);
    
    // Generate names
    const typeNames = names(typeName);
    const libName = options.name || pluralize(typeNames.fileName);
    const libNames = names(libName);
    const directory = options.directory || 'libs';
    const libPath = joinPathFragments(directory, libName);
    const typeNamePlural = pluralize(typeNames.fileName);
    const TypeNamePlural = pluralize(typeName);
    
    console.log(`\n📦 Creating wrapPlans library for ${typeName}`);
    console.log(`   Library: ${libPath}/`);
    console.log(`   Import:  @app/${libName}\n`);
    
    // Check if lib already exists
    if (tree.exists(libPath)) {
        throw new Error(`Library ${libPath}/ already exists`);
    }
    
    // Step 1: Generate base library using @nx/js:library
    console.log('🔧 Running nx generate @nx/js:library...');
    execSync(
        `npx nx generate @nx/js:library ${libName} ` +
        `--directory=${libPath} ` +
        `--importPath=@app/${libName} ` +
        `--bundler=tsc ` +
        `--unitTestRunner=jest ` +
        `--linter=eslint ` +
        `--projectNameAndRootFormat=as-provided ` +
        `--no-interactive`,
        { stdio: 'inherit' }
    );
    
    // Re-read tree after execSync (tree doesn't auto-update)
    // We need to delete the default files manually
    console.log('\n📁 Setting up library structure with templates...');
    
    // Remove default generated files
    const defaultFiles = [
        joinPathFragments(libPath, 'src/lib', `${libNames.fileName}.ts`),
        joinPathFragments(libPath, 'src/lib', `${libNames.fileName}.spec.ts`),
    ];
    
    for (const file of defaultFiles) {
        if (tree.exists(file)) {
            tree.delete(file);
        }
    }
    
    // Generate files from templates
    const templateOptions = {
        ...typeNames,
        typeName,
        typeNameLower: typeNames.fileName,
        typeNamePlural,
        TypeNamePlural,
        libName,
        template: '', // removes .template extension
    };
    
    generateFiles(
        tree,
        joinPathFragments(__dirname, 'files'),
        joinPathFragments(libPath, 'src'),
        templateOptions
    );
    
    await formatFiles(tree);
    
    console.log(`\n✅ Library created successfully!`);
    console.log(`
📂 Structure:
${libPath}/
  src/
    index.ts              # Exports all wrapPlans & types
    lib/
      types.ts            # Re-exports all ${typeName} types from @app/gql
      query.ts            # Query wrapPlans
      mutation.ts         # Mutation wrapPlans

📝 Usage in apps/api/src/server/graphile.config.ts:

import { 
    ${typeNames.fileName}QueryWrapPlan,
    ${typeNames.fileName}ByIdQueryWrapPlan,
    ${typeNamePlural}ConnectionWrapPlan,
    create${typeName}WrapPlan,
    update${typeName}WrapPlan,
    delete${typeName}WrapPlan
} from '@app/${libName}';
`);
    
    return () => {
        installPackagesTask(tree);
    };
}
