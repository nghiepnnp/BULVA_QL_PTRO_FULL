// Interface
export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface FilterGroup {
  logic: FilterLogic;
  filters: Array<FilterRule | FilterGroup>;
}

export interface QueryFieldDefinition {
  column: string;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  operators?: readonly FilterOperator[];
}

// Operator
export const FILTER_OPERATORS = [
  'eq', // =
  'neq', // !=
  'gt', // >
  'gte', // >=
  'lt', // <
  'lte', // <=
  'contains',
  'startsWith',
  'endsWith',
  'in',
  'notIn',
  'between',
  'isNull',
  'isNotNull',
] as const;

// Type
export type FilterOperator = (typeof FILTER_OPERATORS)[number];
export type FilterLogic = 'and' | 'or';
export type FilterNode = FilterRule | FilterGroup;
export function isFilterGroup(node: FilterNode): node is FilterGroup {
  return 'filters' in node;
}
export type QueryFieldMap = Record<string, QueryFieldDefinition>;
