import { off } from 'node:process';

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

export interface ProductCategoryFiletrs {
  currentPage: number;
  offset: number;
  searchValue?: string | null;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SubCategoryFilters {
  currentPage: number;
  offset: number;
  categoryId?: number | null;
  searchValue?: string | null;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}
