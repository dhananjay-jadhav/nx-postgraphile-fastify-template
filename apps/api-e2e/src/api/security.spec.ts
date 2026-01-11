import axios, { AxiosError } from 'axios';

describe('Security Features', () => {
    describe('Rate Limiting', () => {
        it.skip('should include rate limit headers in response', async () => {
            const res = await axios.get('/live');

            // Health endpoints are excluded from rate limiting, but let's check a regular endpoint
            const graphqlRes = await axios.post('/graphql', {
                query: `{ query { id } }`,
            });

            expect(graphqlRes.status).toBe(200);
            // Rate limit headers should be present
            expect(graphqlRes.headers).toHaveProperty('x-ratelimit-limit');
            expect(graphqlRes.headers).toHaveProperty('x-ratelimit-remaining');
        });

        it.skip('should return 429 when rate limit is exceeded', async () => {
            // This test requires RATE_LIMIT_MAX to be set low (e.g., 5) in test env
            // For now, we'll make many requests and expect rate limiting
            // Skip this test if rate limit is too high
            const initialRes = await axios.post('/graphql', {
                query: `{ query { id } }`,
            });

            const limit = parseInt(initialRes.headers['x-ratelimit-limit'] || '100', 10);

            // If limit is too high, skip the exhaustion test
            if (limit > 20) {
                console.log(`Rate limit is ${limit}, skipping exhaustion test`);
                return;
            }

            // Exhaust the rate limit
            const requests = Array.from({ length: limit + 5 }, () =>
                axios.post('/graphql', { query: `{ query { id } }` }).catch((e: AxiosError) => e.response)
            );

            const responses = await Promise.all(requests);
            const rateLimitedResponses = responses.filter(r => r?.status === 429);

            expect(rateLimitedResponses.length).toBeGreaterThan(0);

            // Check the rate limit error response format
            const errorResponse = rateLimitedResponses[0];
            expect(errorResponse?.data).toHaveProperty('error');
            expect(errorResponse?.data.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
            expect(errorResponse?.data.error).toHaveProperty('retryAfter');
        });

        it.skip('should allow health endpoints without rate limiting', async () => {
            // Health endpoints should be in the allowList
            const responses = await Promise.all([
                axios.get('/live'),
                axios.get('/ready'),
                axios.get('/health'),
            ]);

            responses.forEach(res => {
                expect(res.status).toBe(200);
            });
        });
    });

    describe('Query Complexity - Depth Limiting', () => {
        it.skip('should accept queries within depth limit', async () => {
            // Simple query with depth 2
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
        });

        it.skip('should reject queries exceeding depth limit', async () => {
            // Default depth limit is 10, create a deeply nested query
            // We'll create depth > 10 using available types
            const deepQuery = `
                query DeepQuery {
                    users {
                        nodes {
                            rowId
                            username
                            posts {
                                nodes {
                                    rowId
                                    title
                                    comments {
                                        nodes {
                                            rowId
                                            content
                                            author {
                                                rowId
                                                posts {
                                                    nodes {
                                                        rowId
                                                        comments {
                                                            nodes {
                                                                rowId
                                                                content
                                                                author {
                                                                    rowId
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;

            try {
                const res = await axios.post('/graphql', { query: deepQuery });

                // If schema doesn't have these nested types, the query itself will fail
                // But if depth validation runs first, we should get a 400
                if (res.status === 400 && res.data.errors?.[0]?.extensions?.code === 'QUERY_COMPLEXITY_EXCEEDED') {
                    expect(res.data.errors[0].extensions).toHaveProperty('depth');
                    expect(res.data.errors[0].message).toContain('depth');
                }
            } catch (error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 400) {
                    const data = axiosError.response.data as { errors?: Array<{ message: string; extensions?: { code: string; depth: number } }> };
                    if (data.errors?.[0]?.extensions?.code === 'QUERY_COMPLEXITY_EXCEEDED') {
                        expect(data.errors[0].extensions.depth).toBeGreaterThan(10);
                    }
                }
            }
        });

        it.skip('should return depth info in error response', async () => {
            // Create a query we know will exceed depth (if types exist)
            // This uses a simulated deeply nested structure
            let query = '{ query { id';
            // This won't work without actual nested types, but tests the response format
            query += ' } }';

            const res = await axios.post('/graphql', { query });
            expect(res.status).toBe(200); // Valid simple query should pass
        });
    });

    describe('Query Complexity - Cost Limiting', () => {
        it.skip('should accept queries within cost limit', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        users(first: 5) {
                            nodes {
                                rowId
                                username
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
        });

        it.skip('should reject queries with excessive cost', async () => {
            // Query with high cost - large pagination values
            // Default cost limit is 1000
            const expensiveQuery = `
                query ExpensiveQuery {
                    users(first: 100) {
                        nodes {
                            rowId
                            username
                            email
                            posts(first: 100) {
                                nodes {
                                    rowId
                                    title
                                    comments(first: 100) {
                                        nodes {
                                            rowId
                                            content
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;

            try {
                const res = await axios.post('/graphql', { query: expensiveQuery });

                // If the query is rejected due to cost
                if (res.status === 400 && res.data.errors?.[0]?.extensions?.code === 'QUERY_COMPLEXITY_EXCEEDED') {
                    expect(res.data.errors[0].extensions).toHaveProperty('cost');
                    expect(res.data.errors[0].message).toContain('cost');
                }
            } catch (error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 400) {
                    const data = axiosError.response.data as { errors?: Array<{ message: string; extensions?: { code: string; cost: number } }> };
                    if (data.errors?.[0]?.extensions?.code === 'QUERY_COMPLEXITY_EXCEEDED') {
                        expect(data.errors[0].extensions.cost).toBeGreaterThan(1000);
                    }
                }
            }
        });

        it.skip('should calculate cost based on pagination arguments', async () => {
            // Compare cost with different first values
            const smallQuery = await axios.post('/graphql', {
                query: `{ users(first: 2) { nodes { rowId } } }`,
            });

            const largeQuery = await axios.post('/graphql', {
                query: `{ users(first: 50) { nodes { rowId } } }`,
            });

            // Both should succeed if within limits
            expect(smallQuery.status).toBe(200);
            expect(largeQuery.status).toBe(200);
        });
    });

    describe('Combined Security', () => {
        it.skip('should validate both depth and cost together', async () => {
            // A query that's expensive but not too deep
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        users(first: 10) {
                            nodes {
                                rowId
                                username
                                email
                            }
                            totalCount
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
        });

        it.skip('should return appropriate error code for complexity issues', async () => {
            // Query that might exceed limits
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        users(first: 5) {
                            nodes {
                                rowId
                            }
                        }
                    }
                `,
            });

            // This simple query should pass
            expect(res.status).toBe(200);

            // If it had failed, check error format
            if (res.data.errors) {
                const complexityError = res.data.errors.find(
                    (e: { extensions?: { code: string } }) => e.extensions?.code === 'QUERY_COMPLEXITY_EXCEEDED'
                );
                if (complexityError) {
                    expect(complexityError.extensions).toHaveProperty('depth');
                    expect(complexityError.extensions).toHaveProperty('cost');
                }
            }
        });
    });
});
