export interface ProductBrand {
  brandId: number | null;
  brandName: string;
  brandDescription: string;
}

export interface ProductBrandFilters {
  currentPage: number;
  offset: number;
  searchValue?: string | null;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}
