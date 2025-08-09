import { Component, inject } from '@angular/core';
// Required Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-unauthorized-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './admin-unauthorized-page.component.html',
  styleUrl: './admin-unauthorized-page.component.css'
})
export class AdminUnauthorizedPageComponent {
  private readonly router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }

  login() {
    this.router.navigate(['/login']);
  }

}
