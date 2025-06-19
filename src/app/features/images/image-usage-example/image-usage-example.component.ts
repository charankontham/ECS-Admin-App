import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageUploaderComponent } from '../image-uploader/image-uploader.component';
import { CommonModule } from '@angular/common';
import { ImageDoc } from '../../../core/models/image.model';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-image-usage-example',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    ImageUploaderComponent,
  ],
  templateUrl: './image-usage-example.component.html',
  styleUrl: './image-usage-example.component.css',
})
export class ImageUsageExampleComponent {
  lastUploadedImage: ImageDoc | null = null;
  exampleImageId = '';

  constructor(
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {}

  onImageUploaded(image: ImageDoc): void {
    // const input = event.target as HTMLInputElement;
    this.lastUploadedImage = {
      id: image.id,
      imageName: image.imageName,
      contentType: image.contentType,
      uploadedDate: image.uploadedDate,
      size: image.size,
      dimensions: image.dimensions,
      comments: image.comments,
      image: image.image,
    };
  }

  onExampleImageUploaded(image: ImageDoc): void {
    this.exampleImageId = image.id || '';
    this.snackBar.open(`Example image uploaded: ${image.id}`, 'Close', {
      duration: 3000,
    });
  }

  onImageRemoved(): void {
    this.lastUploadedImage = null;
  }

  onUploadError(error: string): void {
    console.error('Upload error:', error);
  }
}
