import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';

export const IMAGES_ROUTES: Routes = [
  {
    path: '',
    component: ImageGalleryComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory', 'marketing', 'logistics'] },
  },
  {
    path: 'image-uploader',
    component: ImageUploaderComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin', subRoles: ['inventory', 'marketing', 'logistics'] },
  },
];
