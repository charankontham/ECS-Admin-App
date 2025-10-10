export interface BaseFilters {
  searchValue?: string | null;
  offset: number;
  currentPage: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}
