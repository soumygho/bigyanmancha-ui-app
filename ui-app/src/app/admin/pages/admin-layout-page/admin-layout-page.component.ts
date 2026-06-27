import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminMenuBarComponent } from '../../components/admin-menu-bar/admin-menu-bar.component';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-admin-layout-page',
  templateUrl: './admin-layout-page.component.html',
  styleUrls: ['./admin-layout-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    AdminMenuBarComponent,
    CommonModule,
    MatProgressSpinnerModule,
  ],
})
export class AdminLayoutPageComponent implements OnInit {
  private spinnerService = inject(LoadingSpinnerService);
  readonly isLoading = computed(() => this.spinnerService.isLoading());

  constructor() {}

  ngOnInit() {}
}
