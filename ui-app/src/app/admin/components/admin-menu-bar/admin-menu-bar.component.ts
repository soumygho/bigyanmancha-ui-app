import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-menu-bar',
  templateUrl: './admin-menu-bar.component.html',
  styleUrls: ['./admin-menu-bar.component.css'],
  imports: [MatIconModule, CommonModule, RouterModule],
  standalone: true
})
export class AdminMenuBarComponent implements OnInit {

private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private isAdminUrl = signal(this.router.url === '/admin');
  constructor() { }

  ngOnInit() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe(() => {
        this.isAdminUrl.set(this.router.url === '/admin');
        console.trace(this.shouldShow());
      }
      );
  }
  readonly shouldShow = computed(() => !this.isAdminUrl());

  logout() {

  }
}
