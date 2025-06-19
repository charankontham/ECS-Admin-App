export interface ImageDoc {
  id?: string;
  imageName: string;
  contentType: string;
  uploadedDate?: Date;
  size: number;
  dimensions?: string;
  comments?: string;
  image: string;
  imageURL?: string;
}

export interface ImageFilters {
  currentPage: number;
  offset: number;
  imageSize?: number;
  dimensions?: string;
  contentType?: string;
  searchValue?: string;
}
