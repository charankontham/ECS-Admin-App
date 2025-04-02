export interface ProductCategory {
  categoryId: number | null;
  categoryName: string;
  categoryImage: string;
}

export interface SubCategory {
  subCategoryId: number;
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
