import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-portal-menu-bar',
  templateUrl: './portal-menu-bar.component.html',
  styleUrls: ['./portal-menu-bar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PortalMenuBarComponent implements OnInit {
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
        console.trace(this.shouldShow());
      }
      );
  }
  readonly shouldShow = computed(() => !this.isAdminUrl());
}

