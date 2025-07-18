import { CommonModule } from '@angular/common';
import {
  Component,
  type ElementRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageService } from '../../../core/services/image.service';
import { ImageDoc } from '../../../core/models/image.model';
import { finalize } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.css',
})
export class ImageUploaderComponent {
  @Input() currentImageId = '';
  @Input() placeholderText = 'Upload an image';
  @Input() placeholderIcon = 'image';
  @Input() imageAltText = 'Product image';
  @Input() acceptedFileTypes = 'image/*';
  @Input() allowMultiple = false;
  @Input() compact = false;
  @Input() maxFileSizeMB = 5;
  @Input() disableUploadNewButton = false;
  @Input() currentImageUrl = 'assets/images/image-placeholder.jpg';
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Output() dataEmitter = new EventEmitter<string>();

  uploading = false;
  isDragging = false;
  selectedFile: File | null = null;
  @Input() enterImageIdMode = false;
  @Input() enableEnterImageIdButton = false;
  enteredImageId = '';

  constructor(
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.currentImageId) {
      this.getImageUrl();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      var imageDoc: ImageDoc;
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1]; // Remove "data:image/png;base64,"
        imageDoc = {
          id: '',
          imageName: this.selectedFile?.name || '',
          contentType: this.selectedFile?.type || '',
          uploadedDate: new Date(),
          size: this.selectedFile?.size || 0,
          // dimentions: `${this.selectedFile?.width || 0}x${this.selectedFile?.height || 0}`,
          comments: 'Uploaded via file input',
          image: base64Data,
        };
        if (this.currentImageId) {
          imageDoc.id = this.currentImageId;
        }
        this.uploadImage(imageDoc);
      };
    }
  }

  uploadImage(imageDoc: ImageDoc): void {
    if (!imageDoc) {
      return;
    }
    this.uploading = true;
    if (imageDoc.id && imageDoc.id.trim() !== '') {
      this.imageService
        .updateImage(imageDoc)
        .pipe(
          finalize(() => {
            this.uploading = false;
            this.selectedFile = null;
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
          })
        )
        .subscribe({
          next: (response: ImageDoc) => {
            if (response) {
              this.currentImageId = response.id || '';
              console.log('Image updated successfully : ', response);
              this.getImageUrl();
              this.dataEmitter.emit(response.id);
              this.snackBar.open(
                'Image updated successfully : ' + response.id,
                'Close',
                {
                  duration: 3000,
                }
              );
            } else {
              this.snackBar.open(
                response || 'Failed to update image',
                'Close',
                {
                  duration: 5000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                  panelClass: ['error-snackbar'],
                }
              );
            }
          },
          error: (error) => {
            console.error('Error updating image', error);
            this.handleError('Failed to update image. Please try again.');
          },
        });
      return;
    }
    this.imageService
      .addImage(imageDoc)
      .pipe(
        finalize(() => {
          this.uploading = false;
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        })
      )
      .subscribe({
        next: (response: ImageDoc) => {
          if (response) {
            this.currentImageId = response.id || '';
            console.log('Image uploaded successfully : ', response);
            this.getImageUrl();
            this.snackBar.open(
              'Image uploaded successfully : ' + response.id,
              'Close',
              {
                duration: 3000,
              }
            );
            this.dataEmitter.emit(response.id);
          } else {
            this.snackBar.open(response || 'Failed to upload image', 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          }
        },
        error: (error) => {
          console.error('Error uploading image', error);
          this.handleError('Failed to upload image. Please try again.');
        },
      });
  }

  removeImage(): void {
    this.imageService.deleteImage(this.currentImageId).subscribe({
      next: (response: HttpResponse<string>) => {
        if (response.status == 200 && response.body?.includes('successfully')) {
          this.currentImageId = '';
          this.snackBar.open('Image removed successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          this.dataEmitter.emit('');
        } else {
          this.handleError('Failed to remove image. Please try again.');
        }
      },
      error: (error) => {
        console.error('Error removing image', error);
        this.handleError(
          'Failed to remove image. Please check console for error.'
        );
      },
    });
  }

  refresh(): void {
    this.currentImageUrl = 'assets/images/image-placeholder.jpg';
    this.currentImageId = '';
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.isDragging = false;
    this.uploading = false;
    this.enterImageIdMode = false;
    this.enteredImageId = '';
    console.log('Image uploader refreshed');
    this.snackBar.open('Image uploader refreshed', 'Close', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar'],
    });
  }

  mapToImageURL(imageDoc: ImageDoc): string {
    return `data:${imageDoc.contentType};base64,${imageDoc.image}`;
  }

  getImageUrl(): string {
    if (this.currentImageId) {
      console.log('Current image ID : ', this.currentImageId);
      this.imageService.getImageById(this.currentImageId).subscribe({
        next: (imageDoc) => {
          this.currentImageUrl = this.mapToImageURL(imageDoc);
        },
        error: (error) => {
          console.error('Error loading image:', error);
          this.handleError('Failed to load image with the provided ID');
          this.currentImageUrl = 'assets/images/image-placeholder.jpg';
        },
      });
    }
    return 'assets/images/image-placeholder.jpg';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/image-error.png';
  }

  copyImageId(): void {
    if (!this.currentImageId) return;

    navigator.clipboard.writeText(this.currentImageId || '').then(() => {
      this.snackBar.open('Image ID copied to clipboard', 'Close', {
        duration: 2000,
      });
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.handleError('Only image files are allowed');
        return;
      }

      // Validate file size
      if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        this.handleError(`File size exceeds ${this.maxFileSizeMB}MB limit`);
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      var imageDoc: ImageDoc;
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        imageDoc = {
          id: '',
          imageName: this.selectedFile?.name || '',
          contentType: this.selectedFile?.type || '',
          uploadedDate: new Date(),
          size: this.selectedFile?.size || 0,
          // dimentions: `${this.selectedFile?. || 0}x${this.selectedFile?.height || 0}`,
          comments: 'Uploaded via drag and drop',
          image: base64Data,
        };
        this.uploadImage(imageDoc);
      };
    }
  }

  toggleEnterImageId(): void {
    this.enterImageIdMode = !this.enterImageIdMode;
    if (!this.enterImageIdMode) {
      this.enteredImageId = '';
    }
  }

  addImageId(): void {
    if (!this.enteredImageId.trim()) {
      this.snackBar.open('Please enter a valid Image ID', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.currentImageId = this.enteredImageId.trim();
    this.getImageUrl();
    this.dataEmitter.emit(this.currentImageId);
    this.enterImageIdMode = false;
    this.enteredImageId = '';

    this.snackBar.open('Image ID added successfully', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private handleError(message: string): void {
    console.error(message);
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
