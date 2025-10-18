export interface BaseFilters {
  searchValue?: string | null;
  offset: number;
  currentPage: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AddressDto {
  addressId: number;
  userId: string;
  name: string;
  contact: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
