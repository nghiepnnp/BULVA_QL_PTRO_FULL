import type { FilterNode, FilterRule, QueryFieldMap } from './query.types.js';
import { isFilterGroup } from './query.types.js';
import { BadRequestException } from '@nestjs/common';
import { QuerySpecification } from './query-specification.js';
import { QueryFieldResolver } from './query-field.resolver.js';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export class SpecificationEvaluator {
  static apply<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    spec: QuerySpecification,
  ): SelectQueryBuilder<T> {
    
    const fields = QueryFieldResolver.resolve(
      queryBuilder,
      spec.fieldOverrides,
      spec.extraFields,
    );

    this.applySearch(queryBuilder, spec, fields);
    this.applyFilter(queryBuilder, spec, fields);
    this.applySorting(queryBuilder, spec, fields);
    this.applyPaging(queryBuilder, spec);
    // console.log(queryBuilder)
    return queryBuilder;
  }

  // SEARCH
  private static applySearch<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    spec: QuerySpecification,
    fields: QueryFieldMap,
  ) {
    const search = spec.search?.trim();

    if (!search) {
      return;
    }

    const searchableFields = Object.values(fields).filter(
      (field) => field.searchable,
    );

    if (!fields.length) {
      return;
    }

    queryBuilder.andWhere(
      new Brackets((subQuery) => {
        searchableFields.forEach((field, index) => {
          const condition = `${field.column} ILIKE :search`;
          if (index === 0) {
            subQuery.where(condition);
          } else {
            subQuery.orWhere(condition);
          }
        });
      }),
      {
        search: `%${search}%`,
      },
    );
  }

  // FILTER
  private static applyFilter<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    spec: QuerySpecification,
    fields: QueryFieldMap,
  ) {
    if (!spec.filter) {
      return;
    }

    let parameterIndex = 0;

    const nextParameter = () => `filter_${parameterIndex++}`;

    const result = this.buildFilterExpression(
      spec.filter,
      fields,
      nextParameter,
    );

    if (!result.sql) {
      return;
    }

    queryBuilder.andWhere(result.sql, result.params);
  }

  private static buildFilterExpression(
    node: FilterNode,
    fields: QueryFieldMap,
    nextParameter: () => string,
  ): {
    sql: string;
    params: Record<string, unknown>;
  } {
    if (isFilterGroup(node)) {
      if (!node.filters.length) {
        return {
          sql: '',
          params: {},
        };
      }

      const children = node.filters
        .map((child) =>
          this.buildFilterExpression(child, fields, nextParameter),
        )
        .filter((x) => x.sql);
      const joiner = node.logic === 'or' ? ' OR ' : ' AND ';
      return {
        sql: `(${children.map((x) => x.sql).join(joiner)})`,

        params: Object.assign({}, ...children.map((x) => x.params)),
      };
    }

    return this.buildFilterRule(node, fields, nextParameter);
  }

  private static buildFilterRule(
    rule: FilterRule,
    fields: QueryFieldMap,
    nextParameter: () => string,
  ): {
    sql: string;
    params: Record<string, unknown>;
  } {
    const field = fields[rule.field];

    if (!field || !field.filterable) {
      throw new BadRequestException(`Field "${rule.field}" cannot be filtered`);
    }

    if (field.operators && !field.operators.includes(rule.operator)) {
      throw new BadRequestException(
        `Operator "${rule.operator}" is not allowed for "${rule.field}"`,
      );
    }

    const column = field.column;

    const parameter = nextParameter();

    switch (rule.operator) {
      case 'eq':
        if (rule.value === null) {
          return {
            sql: `${column} IS NULL`,
            params: {},
          };
        }
        return {
          sql: `${column} = :${parameter}`,
          params: {
            [parameter]: rule.value,
          },
        };
      case 'neq':
        if (rule.value === null) {
          return {
            sql: `${column} IS NOT NULL`,
            params: {},
          };
        }
        return {
          sql: `${column} <> :${parameter}`,
          params: {
            [parameter]: rule.value,
          },
        };
      case 'gt':
        return {
          sql: `${column} > :${parameter}`,
          params: {
            [parameter]: rule.value,
          },
        };
      case 'gte':
        return {
          sql: `${column} >= :${parameter}`,
          params: {
            [parameter]: rule.value,
          },
        };
      case 'lt':
        return {
          sql: `${column} < :${parameter}`,
          params: {
            [parameter]: rule.value,
          },
        };
      case 'lte':
        return {
          sql: `${column} <= :${parameter}`,
          params: {
            [parameter]: rule.value,
          },
        };
      case 'contains':
        return {
          sql: `${column} ILIKE :${parameter}`,
          params: {
            [parameter]: `%${String(rule.value)}%`,
          },
        };
      case 'startsWith':
        return {
          sql: `${column} ILIKE :${parameter}`,
          params: {
            [parameter]: `${String(rule.value)}%`,
          },
        };
      case 'endsWith':
        return {
          sql: `${column} ILIKE :${parameter}`,
          params: {
            [parameter]: `%${String(rule.value)}`,
          },
        };
      case 'in': {
        if (!Array.isArray(rule.value)) {
          throw new BadRequestException(`"in" requires an array`);
        }
        if (!rule.value.length) {
          return {
            sql: '1 = 0',
            params: {},
          };
        }
        return {
          sql: `${column} IN (:...${parameter})`,

          params: {
            [parameter]: rule.value,
          },
        };
      }
      case 'notIn': {
        if (!Array.isArray(rule.value)) {
          throw new BadRequestException(`"notIn" requires an array`);
        }
        if (!rule.value.length) {
          return {
            sql: '1 = 1',
            params: {},
          };
        }
        return {
          sql: `${column} NOT IN (:...${parameter})`,

          params: {
            [parameter]: rule.value,
          },
        };
      }
      case 'between': {
        if (!Array.isArray(rule.value) || rule.value.length !== 2) {
          throw new BadRequestException(`"between" requires [from, to]`);
        }
        const from = nextParameter();
        const to = nextParameter();
        return {
          sql: `${column} BETWEEN :${from} AND :${to}`,
          params: {
            [from]: rule.value[0],
            [to]: rule.value[1],
          },
        };
      }
      case 'isNull':
        return {
          sql: `${column} IS NULL`,
          params: {},
        };
      case 'isNotNull':
        return {
          sql: `${column} IS NOT NULL`,
          params: {},
        };
      default:
        throw new BadRequestException(`Unsupported operator`);
    }
  }

  // SORT
  private static applySorting<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    spec: QuerySpecification,
    fields: QueryFieldMap,
  ) {
    const sort = spec.sort?.trim() || spec.defaultSort;
    let hasOrder = false;
    const orderedFields = new Set<string>();

    if (sort) {
      for (const raw of sort.split(',')) {
        const value = raw.trim();

        if (!value) {
          continue;
        }

        const isDescending = value.startsWith('-');
        const fieldName = value.replace(/^[+-]/, '');
        const field = fields[fieldName];
        if (!field || !field.sortable) {
          throw new BadRequestException(
            `Field "${fieldName}" cannot be sorted`,
          );
        }

        const direction = isDescending ? 'DESC' : 'ASC';
        if (!hasOrder) {
          queryBuilder.orderBy(field.column, direction);
          hasOrder = true;
        } else {
          queryBuilder.addOrderBy(field.column, direction);
        }

        orderedFields.add(fieldName);
      }
    }

    // stable pagination
    if (spec.tieBreaker && !orderedFields.has(spec.tieBreaker.field)) {
      const field = fields[spec.tieBreaker.field];

      if (field) {
        if (!hasOrder) {
          queryBuilder.orderBy(field.column, spec.tieBreaker.direction);
        } else {
          queryBuilder.addOrderBy(field.column, spec.tieBreaker.direction);
        }
      }
    }
  }

  // PAGING
  private static applyPaging<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    spec: QuerySpecification,
  ) {
    queryBuilder
      .skip((spec.pageNumber - 1) * spec.pageSize)
      .take(spec.pageSize);
  }
}
