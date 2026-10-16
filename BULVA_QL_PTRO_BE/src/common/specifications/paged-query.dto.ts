import { Type } from 'class-transformer';
import type { FilterGroup } from './query.types.js';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PagedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  /**
   * name,-createdAt
   *
   * name       = ASC
   * -createdAt = DESC
   */
  @IsOptional()
  @IsString()
  sort?: string;

  /**
   *
    "filter": {
    "logic": "and",
    "filters": [
        {
            "field": "email",
            "operator": "contains",
            "value": "gmail"
        },
        {
            "field": "createdAt",
            "operator": "gte",
            "value": "2026-01-01"
        }
    ]}
   */
  @IsOptional()
  @IsObject()
  filter?: FilterGroup;
}
