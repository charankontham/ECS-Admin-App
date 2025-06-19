import { ProductBrand } from './product-brand.model';
import { ProductCategory, SubCategoryEnriched } from './product-category.model';

export interface Product {
  productId: number;
  productName: string;
  brand: ProductBrand;
  productSubCategory: SubCategoryEnriched;
  productDescription: string | null;
  productPrice: number;
  productQuantity: number;
  productImage: string;
  productColor: string | null;
  productWeight: number | null;
  dateAdded: Date;
  dateModified: Date;
  productDimensions: string | null;
  productCondition: string | null;
}

export interface ProductRequest {
  productId: number | null;
  productCategoryId: number | null;
  productBrandId: number | null;
  productName: string;
  productDescription: string;
  productPrice: number | null;
  productQuantity: number | null;
  productImage: string;
  productColor: string;
  productWeight: number | null;
  productDimensions: string;
  productCondition: string;
}

export interface ProductFilters {
  categoryId?: number | null;
  subCategoryId?: number | null;
  brandId?: number | null;
  searchValue?: string | null;
  offset: number;
  currentPage: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}
