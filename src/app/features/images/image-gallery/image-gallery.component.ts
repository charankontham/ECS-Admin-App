import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatPaginatorModule,
  type PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ImageService } from '../../../core/services/image.service';
import { ImageDoc, ImageFilters } from '../../../core/models/image.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css',
})
export class ImageGalleryComponent {
  images: ImageDoc[] = [];
  selectedImage: ImageDoc | null = null;
  loading = true;
  totalImages = 0;
  currentPage = 0;
  offset = 10;
  deleteInProgress = false;

  constructor(
    private imageService: ImageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.loading = true;

    // In a real application, you would call your image service with pagination parameters
    // For this example, we'll simulate the API call with mock data
    setTimeout(() => {
      // this.images = this.generateMockImages(this.currentPage, this.pageSize);
      var imageFilters: ImageFilters = {
        currentPage: this.currentPage,
        offset: this.offset,
      };
      this.imageService.getAllImagesByPagination(imageFilters).subscribe({
        next: (response) => {
          this.images = response.content;
          this.totalImages = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products', error);
          this.loading = false;
        },
      });
      this.totalImages = 100; // Mock total count
      this.loading = false;
    }, 800);
  }

  selectImage(image: ImageDoc): void {
    this.selectedImage = image;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.offset = event.pageSize;
    this.loadImages();
    this.selectedImage = null; // Clear selection when changing pages
  }

  navigateToAddImage(): void {
    this.router.navigate(['/inventory/images/image-uploader']);
  }

  confirmDelete(): void {
    if (!this.selectedImage || this.deleteInProgress) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Image',
        message: `Are you sure you want to delete the image "${this.selectedImage.imageName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteImage();
      }
    });
  }

  deleteImage(): void {
    if (!this.selectedImage) return;

    this.deleteInProgress = true;
    const imageId = this.selectedImage.id;

    // In a real application, you would call your image service to delete the image
    // For this example, we'll simulate the API call
    setTimeout(() => {
      // Remove the image from the list
      this.images = this.images.filter((img) => img.id !== imageId);
      this.totalImages--;

      // Clear selection
      this.selectedImage = null;
      this.deleteInProgress = false;

      this.snackBar.open('Image deleted successfully', 'Close', {
        duration: 3000,
      });
    }, 1000);
  }

  copyImageId(): void {
    if (!this.selectedImage) return;

    navigator.clipboard.writeText(this.selectedImage.id || '').then(() => {
      this.snackBar.open('Image ID copied to clipboard', 'Close', {
        duration: 2000,
      });
    });
  }

  copyImageUrl(): void {
    if (!this.selectedImage) return;

    navigator.clipboard.writeText(this.selectedImage.id || '').then(() => {
      this.snackBar.open('Image URL copied to clipboard', 'Close', {
        duration: 2000,
      });
    });
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/image-placeholder.jpg';
  }

  // Helper method to generate mock data for the example
  private generateMockImages(page: number, pageSize: number): ImageDoc[] {
    const startIndex = page * pageSize;
    const images: ImageDoc[] = [];

    for (let i = 0; i < pageSize; i++) {
      const index = startIndex + i;
      if (index >= 100) break; // Limit to 100 mock images

      const id = `IMG${(index + 1).toString().padStart(4, '0')}`;
      images.push({
        id: id,
        imageName: `Product Image ${index + 1}`,
        // url: `https://picsum.photos/id/${(index % 30) + 1}/400/400`,
        // uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        size: Math.floor(Math.random() * 900) + 100,
        image: 'https://picsum.photos/id/' + ((index % 30) + 1) + '/400/400',
        contentType: Math.random() > 0.5 ? 'image/jpeg' : 'image/png',
        // dimensions: {
        //   width: Math.floor(Math.random() * 1000) + 500,
        //   height: Math.floor(Math.random() * 1000) + 500,
        // },
      });
    }

    return images;
  }
}
