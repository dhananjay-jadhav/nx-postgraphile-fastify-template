import {
  ValidationResult,
  ValidationOptions,
  calculateQueryDepth,
  estimateQueryCost,
  validateQuery,
} from './query-validation';
import {
  DocumentNode,
  FieldNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  SelectionSetNode,
} from 'graphql';

// Helper to construct FieldNode with optional selectionSet and arguments
function fieldNode(name: string, selectionSet?: SelectionSetNode, args?: any[]): FieldNode {
  return {
    kind: 'Field',
    name: { kind: 'Name', value: name },
    selectionSet: selectionSet,
    arguments: args,
    loc: undefined,
  };
}

// Helper to construct SelectionSetNode
function selectionSet(selections: any[]): SelectionSetNode {
  return {
    kind: 'SelectionSet',
    selections,
    loc: undefined,
  };
}

// Helper to construct FragmentDefinitionNode
function fragmentDef(name: string, selectionSet: SelectionSetNode): FragmentDefinitionNode {
  return {
    kind: 'FragmentDefinition',
    name: { kind: 'Name', value: name },
    typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Type' } },
    selectionSet,
    directives: [],
    loc: undefined,
  };
}

describe('query-validation', () => {
  it('calculates query depth for flat query', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('foo'),
            fieldNode('bar'),
          ]),
        } as OperationDefinitionNode,
      ],
    };
    expect(calculateQueryDepth(doc)).toBe(1);
  });

  it('calculates query depth for nested query', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('foo', selectionSet([
              fieldNode('bar', selectionSet([
                fieldNode('baz'),
              ])),
            ])),
          ]),
        } as OperationDefinitionNode,
      ],
    };
    expect(calculateQueryDepth(doc)).toBe(3);
  });

  it('calculates depth with fragments', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        fragmentDef('FragA', selectionSet([
          fieldNode('alpha', selectionSet([
            fieldNode('beta'),
          ])),
        ])),
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            {
              kind: 'FragmentSpread',
              name: { kind: 'Name', value: 'FragA' },
            },
          ]),
        } as OperationDefinitionNode,
      ],
    };
    expect(calculateQueryDepth(doc)).toBe(2);
  });

  it('estimates cost for simple non-list queries', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('foo'),
            fieldNode('bar'),
          ]),
        } as OperationDefinitionNode,
      ],
    };
    expect(estimateQueryCost(doc)).toBe(2);
  });

  it('estimates cost for list/connection fields', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('users'), // ends with s, treated as list/connection
          ]),
        } as OperationDefinitionNode,
      ],
    };
    // 10 (connection) * 10 (default multiplier for unbounded list)
    expect(estimateQueryCost(doc)).toBe(100);
  });

  it('estimates cost with paginated connection', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('friendsConnection', undefined, [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'IntValue', value: '5' },
              },
            ]),
          ]),
        } as OperationDefinitionNode,
      ],
    };
    expect(estimateQueryCost(doc)).toBe(50); // 10 * 5
  });

  it('estimates cost with fragment spreads', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        fragmentDef('FragCost', selectionSet([
          fieldNode('foo'),
        ])),
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            {
              kind: 'FragmentSpread',
              name: { kind: 'Name', value: 'FragCost' },
            },
          ]),
        } as OperationDefinitionNode,
      ],
    };
    expect(estimateQueryCost(doc)).toBe(1);
  });

  it('validates queries within depth and cost limits', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('foo'),
          ]),
        } as OperationDefinitionNode,
      ],
    };
    const result: ValidationResult = validateQuery(doc, { maxDepth: 2, maxCost: 10 });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('invalidates query exceeding depth limit', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('foo', selectionSet([
              fieldNode('bar', selectionSet([
                fieldNode('baz'),
              ])),
            ])),
          ]),
        } as OperationDefinitionNode,
      ],
    };
    const result: ValidationResult = validateQuery(doc, { maxDepth: 2, maxCost: 100 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('depth'))).toBe(true);
  });

  it('invalidates query exceeding cost limit', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          selectionSet: selectionSet([
            fieldNode('users'), // treated as list/connection
          ]),
        } as OperationDefinitionNode,
      ],
    };
    const result: ValidationResult = validateQuery(doc, { maxDepth: 10, maxCost: 20 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('cost'))).toBe(true);
  });

  it('handles empty DocumentNode gracefully', () => {
    const doc: DocumentNode = {
      kind: 'Document',
      definitions: [],
    };
    const result: ValidationResult = validateQuery(doc, { maxDepth: 2, maxCost: 10 });
    expect(result.valid).toBe(true);
    expect(result.depth).toBe(0);
    expect(result.cost).toBe(0);
    expect(result.errors.length).toBe(0);
  });
});
