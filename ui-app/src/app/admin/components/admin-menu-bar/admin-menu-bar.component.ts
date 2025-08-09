import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';
import { StateManagerService } from '../../services/state-manager.service';

@Component({
  selector: 'app-admin-menu-bar',
  templateUrl: './admin-menu-bar.component.html',
  styleUrls: ['./admin-menu-bar.component.css'],
  imports: [MatIconModule, CommonModule, RouterModule],
  standalone: true,
})
export class AdminMenuBarComponent implements OnInit {
  private readonly disallowedUrls = ['/admin', '/admin/login', '/unauthorized'];
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private readonly authService = inject(AdminAuthService);
  private readonly stateManagerService = inject(StateManagerService);

  private isAdminUrl = signal(this.disallowedUrls.includes(this.router.url));

  ngOnInit() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(filter((ev) => ev instanceof NavigationEnd))
      .subscribe(() => {
        this.isAdminUrl.set(this.disallowedUrls.includes(this.router.url));
        console.trace(this.shouldShow());
      });
    this.authService.isAuthenticated();
  }
  readonly shouldShow = computed(() => !this.isAdminUrl());
  readonly shouldShowLogoutButton = computed(() =>
    this.authService.isAuthenticatedSignal()
  );
  readonly isAdminUser = computed(
    () =>
      this.authService.isAuthenticatedSignal() && this.authService.isAdminUser()
  );
  readonly isVigyanKendraUserOrAdmin = computed(
    () =>
      this.authService.isAuthenticatedSignal() &&
      this.authService.isVigyanKendraUserOrAdmin()
  );
  logout() {
    this.stateManagerService.destroyGlobalState();
    this.authService.logout();
    this.router.navigate(['/admin/']);
  }
}
