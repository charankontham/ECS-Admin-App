import { BaseFilters } from './common.model';

export interface ProductCategory {
  categoryId: number | null;
  categoryName: string;
  categoryImage: string;
}

export interface SubCategory {
  subCategoryId: number | null;
  categoryId: number;
  subCategoryName: string;
  subCategoryDescription: string;
  subCategoryImage: string;
}

export interface SubCategoryEnriched {
  subCategoryId: number;
  productCategory: ProductCategory;
  subCategoryName: string;
  subCategoryDescription: string;
  subCategoryImage: string;
}

export interface ProductCategoryFiletrs extends BaseFilters {
  type: 'productCategory';
}

export interface SubCategoryFilters extends BaseFilters {
  type: 'subCategory';
  categoryId?: number | null;
}
