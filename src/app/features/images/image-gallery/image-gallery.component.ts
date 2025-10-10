import {
  AfterViewInit,
  Component,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatPaginatorModule,
  MatPaginator,
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
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    FormsModule,
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
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css',
})
export class ImageGalleryComponent implements OnInit, AfterViewInit {
  images: ImageDoc[] = [];
  selectedImage: ImageDoc | null = null;
  loading = true;
  totalImages = 0;
  currentPage = 0;
  offset = 6;
  deleteInProgress = false;
  editMode = false;
  editImageName = '';
  saveInProgress = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private imageService: ImageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator._intl.getRangeLabel = (
        page: number,
        pageSize: number,
        length: number
      ) => {
        if (length === 0 || pageSize === 0) {
          return `Page 1 (0 of ${length})`;
        }

        const startIndex = page * pageSize;
        const endIndex =
          startIndex < length
            ? Math.min(startIndex + pageSize, length)
            : startIndex + pageSize;
        const currentPage = page + 1;

        return `Page ${currentPage} (${
          startIndex + 1
        } - ${endIndex} of ${length})`;
      };
    }
  }

  loadImages(): void {
    this.loading = true;
    setTimeout(() => {
      var imageFilters: ImageFilters = {
        type: 'image',
        currentPage: this.currentPage,
        offset: this.offset,
      };
      this.imageService.getAllImagesByPagination(imageFilters).subscribe({
        next: (response) => {
          this.images = response.content;
          this.totalImages = response.totalElements;
          this.paginator.firstPage();
          this.loading = false;
          setTimeout(() => {
            if (this.paginator) {
              this.paginator.pageIndex = this.currentPage;
              this.paginator.pageSize = this.offset;
              this.paginator.length = this.totalImages;
              this.paginator._intl.changes.next();

              this.paginator._intl.getRangeLabel = (
                page: number,
                pageSize: number,
                length: number
              ) => {
                if (length === 0 || pageSize === 0) {
                  return `Page 1 (0 of ${length})`;
                }

                const startIndex = page * pageSize;
                const endIndex =
                  startIndex < length
                    ? Math.min(startIndex + pageSize, length)
                    : startIndex + pageSize;
                const currentPage = page + 1;

                return `Page ${currentPage} (${
                  startIndex + 1
                } - ${endIndex} of ${length})`;
              };
            }
          }, 0);
        },
        error: (error) => {
          console.error('Error loading products', error);
          this.loading = false;
        },
      });
      this.loading = false;
    }, 300);
  }

  refreshImages(): void {
    this.selectedImage = null;
    this.currentPage = 0;
    this.loadImages();
    this.snackBar.open('Images refreshed', 'Close', {
      duration: 2000,
    });
  }

  selectImage(image: ImageDoc): void {
    this.selectedImage = image;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.offset = event.pageSize;
    console.log(
      'Page changed to:',
      this.currentPage,
      'with offset:',
      this.offset
    );
    this.loadImages();
    this.selectedImage = null;
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
        message: `Are you sure you want to delete the image "${this.selectedImage.imageName}" ? This action cannot be undone.`,
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
    const imageId = this.selectedImage.id || '';
    this.imageService.deleteImage(imageId).subscribe({
      next: (response: HttpResponse<string>) => {
        if (response.status == 200 && response.body?.includes('successfully')) {
          setTimeout(() => {
            this.images = this.images.filter((img) => img.id !== imageId);
            this.totalImages--;
            this.selectedImage = null;
            this.deleteInProgress = false;
            this.snackBar.open('Image deleted successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
          }, 1000);
        } else {
          this.handleError('Failed to remove image. Please try again.');
        }
      },
      error: (error) => {
        console.error('Error deleting image', error);
        this.handleError(
          'Failed to delete image. Please check console for error.'
        );
      },
    });
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

  toggleEditMode(): void {
    if (!this.selectedImage) return;

    this.editMode = !this.editMode;

    if (this.editMode) {
      this.editImageName = this.selectedImage.imageName || '';
    } else {
      this.editImageName = '';
    }
  }

  updateImageChanges(): void {
    if (
      !this.selectedImage ||
      !this.editImageName.trim() ||
      this.saveInProgress
    ) {
      return;
    }
    this.saveInProgress = true;
    this.imageService
      .updateImageField(this.selectedImage.id || '', this.editImageName.trim())
      .subscribe({
        next: (updatedImage) => {
          setTimeout(() => {
            if (updatedImage) {
              const imageIndex = this.images.findIndex(
                (img) => img.id === updatedImage!.id
              );
              if (imageIndex !== -1) {
                this.images[imageIndex] = updatedImage;
                this.selectedImage = updatedImage;
              }
            }

            this.editMode = false;
            this.editImageName = '';
            this.saveInProgress = false;

            this.snackBar.open('Image name updated successfully', 'Close', {
              duration: 3000,
            });
          }, 1000);
        },
        error: (error) => {
          console.error('Error updating image name', error);
          this.snackBar.open('Failed to update image name', 'Close', {
            duration: 3000,
          });
          this.saveInProgress = false;
        },
      });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editImageName = '';
  }

  private handleError(message: string): void {
    console.error(message);
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
