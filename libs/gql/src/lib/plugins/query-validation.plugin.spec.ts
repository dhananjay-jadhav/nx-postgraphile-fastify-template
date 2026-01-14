import { GraphQLError } from 'graphql';

// Mocks and stubs
jest.mock('@app/utils', () => ({
  env: {
    GRAPHQL_DEPTH_LIMIT: 3,
    GRAPHQL_COST_LIMIT: 15,
  },
  logger: {
    warn: jest.fn(),
  },
}));

// Mock validateQuery
const mockValidateQuery = jest.fn();
jest.mock('../validation/query-validation', () => ({
  validateQuery: mockValidateQuery,
}));

// DO NOT import plugin before mocks above!
const { QueryValidationPlugin } = require('./query-validation.plugin');
const { logger } = require('@app/utils');

describe('QueryValidationPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildEvent(document?: object) {
    return { args: { document } };
  }

  it('should call next() if document is not provided', async () => {
    const next = jest.fn();
    await QueryValidationPlugin.grafast.middleware.prepareArgs(next, buildEvent(undefined));
    expect(next).toHaveBeenCalled();
    expect(mockValidateQuery).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should validate and allow a valid query', async () => {
    mockValidateQuery.mockReturnValueOnce({
      valid: true,
      depth: 2,
      cost: 8,
      errors: [],
    });
    const next = jest.fn();
    const fakeDoc = { foo: 'bar' };
    await QueryValidationPlugin.grafast.middleware.prepareArgs(next, buildEvent(fakeDoc));
    expect(mockValidateQuery).toHaveBeenCalledWith(fakeDoc, { maxDepth: 3, maxCost: 15 });
    expect(next).toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should reject and throw GraphQLError for depth/cost violation', async () => {
    mockValidateQuery.mockReturnValueOnce({
      valid: false,
      depth: 5,
      cost: 60,
      maxDepth: 3,
      maxCost: 15,
      errors: ['Query depth too much', 'Query cost too high'],
    });
    const next = jest.fn();
    const doc = { kind: 'Document' };
    let thrown;
    try {
      await QueryValidationPlugin.grafast.middleware.prepareArgs(next, buildEvent(doc));
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(GraphQLError);
    expect(thrown.message).toBe('Query depth too much');
    expect(thrown.extensions).toMatchObject({
      code: 'QUERY_COMPLEXITY_EXCEEDED',
      depth: 5,
      cost: 60,
      maxDepth: 3,
      maxCost: 15,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        depth: 5,
        cost: 60,
        maxDepth: 3,
        maxCost: 15,
        errors: ['Query depth too much', 'Query cost too high'],
      }),
      'GraphQL query rejected due to complexity'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw only first error message', async () => {
    mockValidateQuery.mockReturnValueOnce({
      valid: false,
      depth: 3,
      cost: 77,
      maxDepth: 2,
      maxCost: 10,
      errors: ['First error!', 'Another error'],
    });
    const next = jest.fn();
    const doc = { kind: 'Document' };
    try {
      await QueryValidationPlugin.grafast.middleware.prepareArgs(next, buildEvent(doc));
    } catch (e) {
      expect(e).toBeInstanceOf(GraphQLError);
      expect(e.message).toContain('First error!');
    }
  });
});
