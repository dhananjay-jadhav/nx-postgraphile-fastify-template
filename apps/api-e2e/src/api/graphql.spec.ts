import axios from 'axios';

describe('GraphQL API', () => {
    describe('Query.query', () => {
        it('should return the root query', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        query {
                            id
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.query).toHaveProperty('id');
        });
    });

    describe('Query.node', () => {
        it('should return null for non-existent node ID', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    query GetNode($id: ID!) {
                        node(id: $id) {
                            id
                        }
                    }
                `,
                variables: {
                    id: 'WyJxdWVyeSJd', // Base64 encoded non-existent ID
                },
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.node).toBeNull();
        });

        it('should fetch Query node using its ID', async () => {
            // First get the Query node ID
            const queryRes = await axios.post('/graphql', {
                query: `
                    query {
                        query {
                            id
                        }
                    }
                `,
            });

            const queryNodeId = queryRes.data.data.query.id;

            // Now fetch it using the node query
            const nodeRes = await axios.post('/graphql', {
                query: `
                    query GetNode($id: ID!) {
                        node(id: $id) {
                            id
                            ... on Query {
                                __typename
                            }
                        }
                    }
                `,
                variables: {
                    id: queryNodeId,
                },
            });

            expect(nodeRes.status).toBe(200);
            expect(nodeRes.data.errors).toBeUndefined();
            expect(nodeRes.data.data.node).toHaveProperty('id', queryNodeId);
            expect(nodeRes.data.data.node).toHaveProperty('__typename', 'Query');
        });
    });

    describe('Introspection', () => {
        it('should return schema types', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        __schema {
                            types {
                                name
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.__schema.types).toBeInstanceOf(Array);

            const typeNames = res.data.data.__schema.types.map((t: { name: string }) => t.name);
            expect(typeNames).toContain('Query');
            expect(typeNames).toContain('Node');
        });

        it('should return Node interface fields', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        __type(name: "Node") {
                            kind
                            name
                            fields {
                                name
                                type {
                                    name
                                    kind
                                }
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.__type).toEqual({
                kind: 'INTERFACE',
                name: 'Node',
                fields: [
                    {
                        name: 'id',
                        type: {
                            name: null,
                            kind: 'NON_NULL',
                        },
                    },
                ],
            });
        });
    });

    describe('Users CRUD', () => {
        const timestamp = Date.now();
        let createdUserId: number;
        let createdUserNodeId: string;

        const testUser = {
            username: `testuser_${timestamp}`,
            email: `test_${timestamp}@example.com`,
            firstName: 'Test',
            lastName: 'User',
            status: 'active',
            role: 'user',
        };

        describe('Create User', () => {
            it('should create a new user', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        mutation CreateUser($input: CreateUserInput!) {
                            createUser(input: $input) {
                                user {
                                    rowId
                                    id
                                    username
                                    email
                                    firstName
                                    lastName
                                    status
                                    role
                                    createdAt
                                    updatedAt
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            user: testUser,
                        },
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.createUser.user).toMatchObject({
                    username: testUser.username,
                    email: testUser.email,
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    status: testUser.status,
                    role: testUser.role,
                });
                expect(res.data.data.createUser.user.rowId).toBeDefined();
                expect(res.data.data.createUser.user.id).toBeDefined();
                expect(res.data.data.createUser.user.createdAt).toBeDefined();

                createdUserId = res.data.data.createUser.user.rowId;
                createdUserNodeId = res.data.data.createUser.user.id;
            });

            it('should fail to create user with duplicate email', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        mutation CreateUser($input: CreateUserInput!) {
                            createUser(input: $input) {
                                user {
                                    rowId
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            user: {
                                ...testUser,
                                username: `different_${timestamp}`,
                            },
                        },
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeDefined();
                expect(res.data.errors.length).toBeGreaterThan(0);
                // Error messages are masked in production mode, so just verify an error occurred
                expect(res.data.errors[0].message).toBeDefined();
                expect(res.data.data.createUser).toBeNull();
            });
        });

        describe('Query Users', () => {
            it('should fetch user by rowId', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        query GetUser($rowId: Int!) {
                            user(rowId: $rowId) {
                                rowId
                                username
                                email
                                firstName
                                lastName
                            }
                        }
                    `,
                    variables: {
                        rowId: createdUserId,
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.user).toMatchObject({
                    rowId: createdUserId,
                    username: testUser.username,
                    email: testUser.email,
                });
            });

            it('should fetch user by global id', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        query GetUserById($id: ID!) {
                            userById(id: $id) {
                                rowId
                                id
                                username
                            }
                        }
                    `,
                    variables: {
                        id: createdUserNodeId,
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.userById.rowId).toBe(createdUserId);
                expect(res.data.data.userById.id).toBe(createdUserNodeId);
            });

            it('should fetch users list with pagination', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        query GetUsers($first: Int) {
                            users(first: $first) {
                                totalCount
                                pageInfo {
                                    hasNextPage
                                    hasPreviousPage
                                }
                                nodes {
                                    rowId
                                    username
                                    email
                                }
                            }
                        }
                    `,
                    variables: {
                        first: 10,
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.users.nodes).toBeInstanceOf(Array);
                expect(res.data.data.users.totalCount).toBeGreaterThanOrEqual(1);
                expect(res.data.data.users.pageInfo).toHaveProperty('hasNextPage');
            });

            it('should filter users by status', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        query GetActiveUsers {
                            users(condition: { status: "active" }) {
                                nodes {
                                    rowId
                                    status
                                }
                            }
                        }
                    `,
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                res.data.data.users.nodes.forEach((user: { status: string }) => {
                    expect(user.status).toBe('active');
                });
            });
        });

        describe('Update User', () => {
            it('should update user by rowId', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        mutation UpdateUser($input: UpdateUserInput!) {
                            updateUser(input: $input) {
                                user {
                                    rowId
                                    firstName
                                    lastName
                                    bio
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            rowId: createdUserId,
                            patch: {
                                firstName: 'Updated',
                                lastName: 'Name',
                                bio: 'Updated bio',
                            },
                        },
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.updateUser.user).toMatchObject({
                    rowId: createdUserId,
                    firstName: 'Updated',
                    lastName: 'Name',
                    bio: 'Updated bio',
                });
            });

            it('should update user by global id', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        mutation UpdateUserById($input: UpdateUserByIdInput!) {
                            updateUserById(input: $input) {
                                user {
                                    rowId
                                    avatarUrl
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            id: createdUserNodeId,
                            patch: {
                                avatarUrl: 'https://example.com/avatar.png',
                            },
                        },
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.updateUserById.user.avatarUrl).toBe('https://example.com/avatar.png');
            });
        });

        describe('Delete User', () => {
            it('should delete user by rowId', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        mutation DeleteUser($input: DeleteUserInput!) {
                            deleteUser(input: $input) {
                                user {
                                    rowId
                                    username
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            rowId: createdUserId,
                        },
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.deleteUser.user.rowId).toBe(createdUserId);
            });

            it('should return null when querying deleted user', async () => {
                const res = await axios.post('/graphql', {
                    query: `
                        query GetUser($rowId: Int!) {
                            user(rowId: $rowId) {
                                rowId
                            }
                        }
                    `,
                    variables: {
                        rowId: createdUserId,
                    },
                });

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.user).toBeNull();
            });
        });
    });
});
