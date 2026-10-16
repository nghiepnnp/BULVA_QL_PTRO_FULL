import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { QuerySpecification } from './query-specification.js';
import { SpecificationEvaluator } from './specification-evaluator-v2.js';
import { PagedResponse, createPagedResponse } from './paged-response.js';

export async function executePagedQuery<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  spec: QuerySpecification,
): Promise<PagedResponse<T>> {
  SpecificationEvaluator.apply(queryBuilder, spec);
  const [items, totalCount] = await queryBuilder.getManyAndCount();
  return createPagedResponse(items, totalCount, spec.pageNumber, spec.pageSize);
}
