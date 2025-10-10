import { BaseFilters } from './common.model';

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

export interface ImageFilters extends BaseFilters {
  type: 'image';
  imageSize?: number;
  dimensions?: string;
  contentType?: string;
}
