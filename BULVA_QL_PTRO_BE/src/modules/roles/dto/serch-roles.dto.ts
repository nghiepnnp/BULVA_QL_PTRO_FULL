// import type { QueryFieldMap } from '#/common/specifications/query.types';
// import { QuerySpecification } from '#/common/specifications/query-specification';
// // import type { PagedQueryDto } from '#/common/specifications/paged-query.dto';
import { PagedQueryDto } from '#/common/specifications/paged-query.dto';


// export const USER_QUERY_FIELDS = {
//   id: {
//     column: 'user.id',
//     sortable: true,
//     filterable: true,
//     operators: ['eq', 'in'],
//   },

//   name: {
//     column: 'user.name',
//     searchable: true,
//     sortable: true,
//     filterable: true,
//     operators: ['eq', 'neq', 'contains', 'startsWith', 'endsWith', 'in'],
//   },

//   email: {
//     column: 'user.email',
//     searchable: true,
//     sortable: true,
//     filterable: true,
//     operators: ['eq', 'neq', 'contains', 'startsWith', 'endsWith'],
//   },

//   createdAt: {
//     column: 'user.createdAt',
//     sortable: true,
//     filterable: true,
//     operators: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'],
//   },
// } satisfies QueryFieldMap;

export class SearchRoleDto extends PagedQueryDto {
//   constructor(query: PagedQueryDto) {
//     super({
//       pageNumber: query.pageNumber,
//       pageSize: query.pageSize,

//       search: query.search,
//       sort: query.sort,
//       filter: query.filter,

//       fields: USER_QUERY_FIELDS,

//       defaultSort: '-createdAt',

//       tieBreaker: {
//         field: 'id',
//         direction: 'DESC',
//       },
//     });
//   }
}
