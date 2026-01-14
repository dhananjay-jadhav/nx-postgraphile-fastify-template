import { LoggingPlugin } from './logging.plugin';

describe('LoggingPlugin', () => {
  let next: jest.Mock;
  let originalPerformanceNow: any;
  let performanceNowValue = 1000;

  // Mock performance.now
  beforeAll(() => {
    originalPerformanceNow = global.performance?.now;
    global.performance = {
      now: jest.fn(() => performanceNowValue),
    } as any;
  });

  afterAll(() => {
    if (originalPerformanceNow) {
      global.performance.now = originalPerformanceNow;
    }
  });

  beforeEach(() => {
    performanceNowValue = 1000;
    next = jest.fn();
    jest.clearAllMocks();
  });

  // Mocks
  const rootLogger = {
    child: jest.fn(function () {
      return this;
    }),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  // Mock @app/utils logger
  jest.mock('@app/utils', () => ({
    logger: rootLogger,
  }));

  // Test prepareArgs behavior
  it('prepareArgs injects traceId, logger, and timing, logs debug', async () => {
    const contextValue = {};
    const requestContext = {
      fastifyv4: {
        request: {
          id: 123,
          log: {
            child: jest.fn(() => rootLogger),
            debug: jest.fn(),
          },
        },
      },
      http: {
        getHeader: jest.fn(() => 'header-req-id'),
      },
    };

    const args = {
      requestContext,
      contextValue,
      operationName: 'GetUsers',
      document: {
        definitions: [
          {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { value: 'GetUsers' },
          },
        ],
      },
      variableValues: { foo: 1 },
    };

    await LoggingPlugin.grafast.middleware.prepareArgs(next, { args });

    expect((contextValue as any).traceId).toBe('123');
    expect((contextValue as any).logger).toBe(rootLogger);
    expect(typeof (contextValue as any)._startTime).toBe('number');
    expect((contextValue as any)._operationName).toBe('GetUsers');
    expect((contextValue as any)._operationType).toBe('query');
    expect(rootLogger.debug).toHaveBeenCalledWith(
      { variables: { foo: 1 } },
      'GraphQL query GetUsers started'
    );
    expect(next).toHaveBeenCalled();
  });

  it('prepareArgs uses fallback traceId from x-request-id header', async () => {
    const contextValue = {};
    const requestContext = {
      fastifyv4: {},
      http: {
        getHeader: jest.fn(() => 'header-req-id'),
      },
    };
    const args = {
      requestContext,
      contextValue,
      operationName: 'GetBooks',
      document: {
        definitions: [
          {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { value: 'GetBooks' },
          },
        ],
      },
    };

    await LoggingPlugin.grafast.middleware.prepareArgs(next, { args });
    expect((contextValue as any).traceId).toBe('header-req-id');
  });

  it('prepareArgs uses crypto.randomUUID as last resort for traceId', async () => {
    const contextValue = {};
    // Remove fastifyv4 and http for this test
    const requestContext = {};
    // Mock crypto.randomUUID
    const randomUUID = jest.fn(() => 'some-uuid');
    (global as any).crypto = { randomUUID };

    const args = {
      requestContext,
      contextValue,
      operationName: null,
      document: null,
    };
    await LoggingPlugin.grafast.middleware.prepareArgs(next, { args });
    expect((contextValue as any).traceId).toBe('some-uuid');
    expect((contextValue as any)._operationName).toBe('unknown');
    expect((contextValue as any)._operationType).toBe('unknown');
  });

  it('prepareArgs attaches logger from fastifyv4.log, else falls back to rootLogger', async () => {
    const contextValue = {};
    const fastifyLogger = {
      child: jest.fn(() => fastifyLogger),
      debug: jest.fn(),
    };
    const requestContext = {
      fastifyv4: {
        request: { id: 9, log: fastifyLogger },
      },
    };
    const args = {
      requestContext,
      contextValue,
      document: {
        definitions: [
          { kind: 'OperationDefinition', operation: 'query', name: { value: 'Demo' } },
        ],
      },
    };
    await LoggingPlugin.grafast.middleware.prepareArgs(next, { args });
    expect(contextValue.logger).toBe(fastifyLogger);
  });

  // Test execute success, info log
  it('execute logs info and returns result if no errors', async () => {
    const ctx: any = {
      _startTime: 1000,
      _operationName: 'Demo',
      _operationType: 'query',
      logger: { ...rootLogger, info: jest.fn() },
    };
    performanceNowValue = 1020;

    const args = { contextValue: ctx };
    const result = { data: { hello: 'world' } };
    const nextExec = jest.fn().mockResolvedValue(result);

    const r = await LoggingPlugin.grafast.middleware.execute(nextExec, { args });
    expect(r).toBe(result);
    expect(ctx.logger.info).toHaveBeenCalledWith(
      { durationMs: 20 },
      'GraphQL query Demo completed in 20ms'
    );
  });

  // Test execute warning with errors
  it('execute logs warn and returns result if errors present', async () => {
    const ctx: any = {
      _startTime: 500,
      _operationName: 'Demo',
      _operationType: 'mutation',
      logger: { ...rootLogger, warn: jest.fn() },
    };
    performanceNowValue = 530;
    const args = { contextValue: ctx };
    const result = { errors: [{ message: 'fail', path: ['field'] }] };
    const nextExec = jest.fn().mockResolvedValue(result);

    const r = await LoggingPlugin.grafast.middleware.execute(nextExec, { args });
    expect(r).toBe(result);
    expect(ctx.logger.warn).toHaveBeenCalledWith(
      {
        durationMs: 30,
        errors: [{ message: 'fail', path: ['field'] }],
      },
      'GraphQL mutation Demo completed with errors in 30ms'
    );
  });

  // Test execute error thrown
  it('execute logs error and rethrows', async () => {
    const ctx: any = {
      _startTime: 1,
      _operationName: 'Foo',
      _operationType: 'subscription',
      logger: { ...rootLogger, error: jest.fn() },
    };
    performanceNowValue = 21;
    const args = { contextValue: ctx };
    const thrown = new Error('Fatal');
    const nextExec = jest.fn().mockRejectedValue(thrown);

    await expect(LoggingPlugin.grafast.middleware.execute(nextExec, { args })).rejects.toThrow(
      'Fatal'
    );
    expect(ctx.logger.error).toHaveBeenCalledWith(
      {
        durationMs: 20,
        error: { message: 'Fatal', stack: expect.any(String) },
      },
      'GraphQL subscription Foo failed after 20ms'
    );
  });
});