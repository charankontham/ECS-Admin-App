import { BaseFilters } from './common.model';

export interface ProductBrand {
  brandId: number | null;
  brandName: string;
  brandDescription: string;
}

export interface ProductBrandFilters extends BaseFilters {
  type: 'productBrand';
}
