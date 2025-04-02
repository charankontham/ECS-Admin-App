import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-marketing-admin',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './marketing-admin.component.html',
  styleUrl: './marketing-admin.component.css',
})
export class MarketingAdminComponent {}
