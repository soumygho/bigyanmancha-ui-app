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

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutPageComponent,
    children: [
      { path: '', component: AdminLoginPageComponent },   // /admin
      { path: 'users', component: AdminUsersPageComponent },   // /admin/users
      { path: 'vigyan-kendra', component:  AdminVigyanKendraPageComponent}, // /admin/settings
      { path: 'student', component: AdminStudentPageComponent},
      {path: 'school', component: AdminSchoolPageComponent},
      {path: 'student-class', component: AdminStudentClassPageComponent},
      {path: 'student-subjects', component: AdminStudentSubjectPageComponent},
      {path: 'exam-center', component: AdminExamCenterPageComponent},
      {path: 'landing-page', component: AdminLandingPageComponent},
      {path: '**', redirectTo: 'landing-page'},
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)],
})
export class AdminModule {}
