import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginPageComponent } from './pages/admin-login-page/admin-login-page.component';
import { AdminLayoutPageComponent } from './pages/admin-layout-page/admin-layout-page.component';
import { AdminUsersPageComponent } from './pages/admin-users-page/admin-users-page.component';
import { AdminVigyanKendraPageComponent } from './pages/admin-vigyan-kendra-page/admin-vigyan-kendra-page.component';
import { AdminStudentPageComponent } from './pages/admin-student-page/admin-student-page.component';
import { AdminSchoolPageComponent } from './pages/admin-school-page/admin-school-page.component';
import { AdminStudentClassPageComponent } from './pages/admin-student-class-page/admin-student-class-page.component';
import { AdminStudentSubjectPageComponent } from './pages/admin-student-subject-page/admin-student-subject-page.component';
import { AdminExamCenterPageComponent } from './pages/admin-exam-center-page/admin-exam-center-page.component';
import { AdminLandingPageComponent } from './pages/admin-landing-page/admin-landing-page.component';
import { AdminEnrollmentSessionPageComponent } from './pages/admin-enrollment-session-page/admin-enrollment-session-page.component';
import { AdminUnauthorizedPageComponent } from './pages/admin-unauthorized-page/admin-unauthorized-page.component';
import { adminPermissionGuard } from './guards/admin-auth.guard';
import { adminOrVigyanKendraPermissionGuard } from './guards/adminorvigyankendra-auth.guard';
import { AdminReportingPageComponent } from './pages/admin-reporting-page/admin-reporting-page.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutPageComponent,
    children: [
      { path: '', component: AdminLoginPageComponent }, // /admin
      { path: 'login', component: AdminLoginPageComponent },
      {
        path: 'users',
        component: AdminUsersPageComponent,
        canActivate: [adminPermissionGuard()],
      },
      {
        path: 'vigyan-kendra',
        component: AdminVigyanKendraPageComponent,
        canActivate: [adminPermissionGuard()],
      },
      {
        path: 'student',
        component: AdminStudentPageComponent,
        canActivate: [adminOrVigyanKendraPermissionGuard()],
      },
      {
        path: 'school',
        component: AdminSchoolPageComponent,
        canActivate: [adminOrVigyanKendraPermissionGuard()],
      },
      {
        path: 'student-class',
        component: AdminStudentClassPageComponent,
        canActivate: [adminPermissionGuard()],
      },
      {
        path: 'student-subjects',
        component: AdminStudentSubjectPageComponent,
        canActivate: [adminPermissionGuard()],
      },
      {
        path: 'exam-center',
        component: AdminExamCenterPageComponent,
        canActivate: [adminOrVigyanKendraPermissionGuard()],
      },
      {
        path: 'landing-page',
        component: AdminLandingPageComponent,
        canActivate: [adminOrVigyanKendraPermissionGuard()],
      },
      {
        path: 'unauthorized',
        component: AdminUnauthorizedPageComponent,
      },
      {
        path: 'enrollment-session',
        component: AdminEnrollmentSessionPageComponent,
        canActivate: [adminPermissionGuard()],
      },
      {
        path: 'reporting',
        component: AdminReportingPageComponent,
        canActivate: [adminOrVigyanKendraPermissionGuard()],
      },
      { path: '**', redirectTo: 'landing-page' },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
