import type {
    QueryFieldDefinition,
    QueryFieldMap,
} from './query.types.js';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';

type QueryFieldOverride = false | Partial<QueryFieldDefinition>;

export type QueryFieldOverrides = Record<string, QueryFieldOverride>;

export class QueryFieldResolver {
  static resolve<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    overrides: QueryFieldOverrides = {},
    extraFields: QueryFieldMap = {},
  ): QueryFieldMap {
    const alias = queryBuilder.expressionMap.mainAlias;

    if (!alias) {
      return extraFields;
    }

    const fields: QueryFieldMap = {};

    for (const metadata of alias.metadata.columns) {
      const fieldName = metadata.propertyPath;
      const override = overrides[fieldName];

      // Cho phép specification loại field cụ thể.
      if (override === false) {
        continue;
      }

      // Loại các field nhạy cảm có select: false.
      if (!metadata.isSelect) {
        continue;
      }

      const defaults = this.createDefinition(alias.name, metadata);

      fields[fieldName] = {
        ...defaults,
        ...override,
      };
    }

    return {
      ...fields,
      ...extraFields,
    };
  }

  private static createDefinition(
    alias: string,
    metadata: ColumnMetadata,
  ): QueryFieldDefinition {
    if (metadata.isArray) {
      return {
        column: `${alias}.${metadata.propertyPath}`,
        sortable: false,
        filterable: false,
        searchable: false,
      };
    }

    if (this.isTextColumn(metadata)) {
      return {
        column: `${alias}.${metadata.propertyPath}`,
        searchable: true,
        sortable: true,
        filterable: true,
        operators: [
          'eq',
          'neq',
          'contains',
          'startsWith',
          'endsWith',
          'in',
          'notIn',
          'isNull',
          'isNotNull',
        ],
      };
    }

    if (this.isComparableColumn(metadata)) {
      return {
        column: `${alias}.${metadata.propertyPath}`,
        searchable: false,
        sortable: true,
        filterable: true,
        operators: [
          'eq',
          'neq',
          'gt',
          'gte',
          'lt',
          'lte',
          'between',
          'in',
          'notIn',
          'isNull',
          'isNotNull',
        ],
      };
    }

    return {
      column: `${alias}.${metadata.propertyPath}`,
      searchable: false,
      sortable: true,
      filterable: true,
      operators: ['eq', 'neq', 'in', 'notIn', 'isNull', 'isNotNull'],
    };
  }

  private static isTextColumn(metadata: ColumnMetadata): boolean {
    return (
      metadata.type === String ||
      ['varchar', 'text', 'char', 'citext'].includes(String(metadata.type))
    );
  }

  private static isComparableColumn(metadata: ColumnMetadata): boolean {
    return (
      metadata.type === Number ||
      metadata.type === Date ||
      [
        'int',
        'integer',
        'smallint',
        'bigint',
        'decimal',
        'numeric',
        'float',
        'date',
        'timestamp',
        'timestamptz',
      ].includes(String(metadata.type))
    );
  }
}
