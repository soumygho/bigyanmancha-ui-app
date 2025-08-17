import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { PortalMenuBarComponent } from '../portal-menu-bar/portal-menu-bar.component';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, PortalMenuBarComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private isAdminUrl = signal(this.router.url.startsWith('/admin'));
  constructor() { }

  ngOnInit() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe(() => {
        this.isAdminUrl.set(this.router.url.startsWith('/admin'));
      }
      );
  }
  readonly shouldShow = computed(() => !this.isAdminUrl());
}


