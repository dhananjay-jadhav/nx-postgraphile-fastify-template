/**
 * GraphQL Test Definitions
 *
 * Add new GraphQL query/mutation tests here.
 * Each test should have a unique key and follow the TestConfig interface.
 */

import { TestConfig } from '../types';

/** Helper to create GraphQL test config */
function gqlTest(
    baseUrl: string,
    name: string,
    query: string,
    variables?: Record<string, unknown>,
    description?: string
): TestConfig {
    return {
        name,
        url: `${baseUrl}/graphql`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        category: 'graphql',
        description,
    };
}

/**
 * Helper to create GraphQL test with dynamic body generator
 * Used for mutations that need unique values per request
 */
function gqlTestDynamic(
    baseUrl: string,
    name: string,
    bodyGenerator: () => string,
    description?: string
): TestConfig {
    return {
        name,
        url: `${baseUrl}/graphql`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // For autocannon, we use setupRequest to generate dynamic body
        body: bodyGenerator(),
        category: 'graphql',
        description,
    };
}

export function getGraphQLTests(baseUrl: string): Record<string, TestConfig> {
    return {
        // Schema & Introspection
        graphql_typename: gqlTest(
            baseUrl,
            'GraphQL __typename',
            `{ __typename }`,
            undefined,
            'Minimal introspection query'
        ),

        graphql_introspection: gqlTest(
            baseUrl,
            'GraphQL Schema Introspection',
            `{
                __schema {
                    types {
                        name
                    }
                }
            }`,
            undefined,
            'Full schema type introspection'
        ),

        // Basic Queries
        graphql_query: gqlTest(
            baseUrl,
            'GraphQL Simple Query',
            `query { query { nodeId } }`,
            undefined,
            'Simple query returning nodeId'
        ),

        graphql_node: gqlTest(
            baseUrl,
            'GraphQL Node Query',
            `query GetNode($id: ID!) {
                node(id: $id) {
                    nodeId
                }
            }`,
            { id: 'WyJxdWVyeSJd' }, // Base64 encoded ["query"]
            'Node interface query'
        ),

        // User Queries
        graphql_users_list: gqlTest(
            baseUrl,
            'GraphQL Users List',
            `query GetUsers {
                users(first: 10) {
                    totalCount
                    nodes {
                        rowId
                        username
                        email
                        status
                    }
                }
            }`,
            undefined,
            'Paginated users list query'
        ),

        graphql_users_filtered: gqlTest(
            baseUrl,
            'GraphQL Users Filtered',
            `query GetActiveUsers {
                users(condition: { status: "active" }, first: 20) {
                    nodes {
                        rowId
                        username
                        email
                    }
                }
            }`,
            undefined,
            'Users filtered by status'
        ),

        graphql_user_by_id: gqlTest(
            baseUrl,
            'GraphQL User by ID',
            `query GetUser($rowId: Int!) {
                user(rowId: $rowId) {
                    rowId
                    username
                    email
                    firstName
                    lastName
                    status
                    role
                    createdAt
                }
            }`,
            { rowId: 1 }, // First user in database
            'Single user lookup by rowId'
        ),

        graphql_user_with_connections: gqlTest(
            baseUrl,
            'GraphQL User Deep Query',
            `query GetUserDeep($rowId: Int!) {
                user(rowId: $rowId) {
                    rowId
                    username
                    email
                    firstName
                    lastName
                    status
                    role
                    bio
                    avatarUrl
                    createdAt
                    updatedAt
                }
            }`,
            { rowId: 2 }, // Second user in database
            'User query fetching all fields'
        ),

        graphql_users_paginated: gqlTest(
            baseUrl,
            'GraphQL Users Paginated',
            `query GetUsersPaginated($first: Int!, $offset: Int) {
                users(first: $first, offset: $offset, orderBy: CREATED_AT_DESC) {
                    totalCount
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                    }
                    nodes {
                        rowId
                        username
                        email
                        status
                    }
                }
            }`,
            { first: 20, offset: 0 },
            'Paginated users with ordering'
        ),

        // User Mutations (use with caution in stress tests - creates/modifies data)
        // Note: create_user is commented out for stress tests as it creates many rows
        // Uncomment for single performance runs or use db:seed to prepare test data
        
        // /*
        graphql_create_user: gqlTest(
            baseUrl,
            'GraphQL Create User',
            `mutation CreateUser($input: CreateUserInput!) {
                createUser(input: $input) {
                    user {
                        rowId
                        username
                        email
                    }
                }
            }`,
            {
                input: {
                    user: {
                        username: `perf_user_${Date.now()}`,
                        email: `perf_${Date.now()}@test.com`,
                        firstName: 'Perf',
                        lastName: 'Test',
                    },
                },
            },
            'Create user mutation'
        ),

        graphql_update_user: gqlTest(
            baseUrl,
            'GraphQL Update User',
            `mutation UpdateUser($input: UpdateUserInput!) {
                updateUser(input: $input) {
                    user {
                        rowId
                        firstName
                        updatedAt
                    }
                }
            }`,
            {
                input: {
                    rowId: 3, // Use rowId 3 which should exist
                    patch: {
                        bio: `Updated via perf test`,
                    },
                },
            },
            'Update user mutation (updates bio field)'
        ),
    };
}
