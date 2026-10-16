// import type { FilterGroup, QueryFieldMap } from './query.types.js';

// export interface QuerySpecificationOptions {
//   pageNumber: number;
//   pageSize: number;
//   search?: string;
//   sort?: string;
//   filter?: FilterGroup;
//   fields: QueryFieldMap;
//   defaultSort?: string;
//   tieBreaker?: {
//     field: string;
//     direction: 'ASC' | 'DESC';
//   };
// }

// export class QuerySpecification {
//   readonly pageNumber: number;
//   readonly pageSize: number;
//   readonly search?: string;
//   readonly sort?: string;
//   readonly filter?: FilterGroup;
//   readonly fields: QueryFieldMap;
//   readonly defaultSort?: string;
//   readonly tieBreaker?: {
//     field: string;
//     direction: 'ASC' | 'DESC';
//   };

//   constructor(options: QuerySpecificationOptions) {
//     this.pageNumber = options.pageNumber;
//     this.pageSize = options.pageSize;
//     this.search = options.search;
//     this.sort = options.sort;
//     this.filter = options.filter;
//     this.fields = options.fields;
//     this.defaultSort = options.defaultSort;
//     this.tieBreaker = options.tieBreaker;
//   }
// }

import type { PagedQueryDto } from './paged-query.dto.js';
import type { FilterGroup, QueryFieldMap } from './query.types.js';

export interface QueryTieBreaker {
  field: string;
  direction: 'ASC' | 'DESC';
}

// export abstract class QuerySpecification {
//   readonly pageNumber: number;
//   readonly pageSize: number;
//   readonly search?: string;
//   readonly sort?: string;
//   readonly filter?: FilterGroup;

//   // readonly fields: QueryFieldMap;

//   readonly defaultSort?: string;
//   readonly tieBreaker?: QueryTieBreaker;

//   constructor(query: PagedQueryDto) {
//     this.pageNumber = query.pageNumber;
//     this.pageSize = query.pageSize;
//     this.search = query.search;
//     this.sort = query.sort;
//     this.filter = query.filter;
//   }
// }
import type { QueryFieldOverrides } from './query-field.resolver.js';

export abstract class QuerySpecification {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly sort?: string;
  readonly filter?: FilterGroup;

  readonly fieldOverrides?: QueryFieldOverrides = {};
  readonly extraFields?: QueryFieldMap = {};

  readonly defaultSort?: string;
  readonly tieBreaker?: QueryTieBreaker;

  constructor(query: PagedQueryDto) {
    this.pageNumber = query.pageNumber;
    this.pageSize = query.pageSize;
    this.search = query.search;
    this.sort = query.sort;
    this.filter = query.filter;
  }
}
