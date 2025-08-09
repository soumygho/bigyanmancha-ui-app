import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export function adminPermissionGuard(): CanActivateFn {
  return () => {
    const auth = inject(AdminAuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigate(['/admin/login']);
      return false;
    }

    const hasPermission = auth.isAdminUser();

    if (!hasPermission) {
      router.navigate(['/admin/unauthorized']);
      return false;
    }

    return true;
  };
}
