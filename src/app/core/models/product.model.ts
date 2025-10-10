import { BaseFilters } from './common.model';
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
  productId?: number;
  productCategoryId: number;
  subCategoryId: number;
  productBrandId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productQuantity: number | null;
  productImage: string | null;
  productColor: string | null;
  productWeight: number | null;
  productDimensions: string | null;
  productCondition: string;
  dateAdded: Date;
  dateModified: Date;
}

export interface ProductFilters extends BaseFilters {
  type: 'product';
  categoryId?: number | null;
  subCategoryId?: number | null;
  brandId?: number | null;
}
