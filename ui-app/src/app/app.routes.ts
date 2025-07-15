import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { EventsComponent } from './pages/events/events.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AdminModule } from './admin/admin.module';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route (redirect to home)
  { path: 'home', component: HomeComponent }, // Route for the home page
  { path: 'gallery', component: GalleryComponent }, // Route for the images page
  { path: 'events', component: EventsComponent }, // Route for upcoming events
  { path: 'contact-us', component: ContactComponent}, // Route for contact us
  {path: 'admin',
    loadChildren : () => import('../app/admin/admin.module').then(m => m.AdminModule)},
  { path: '**', redirectTo: '/home' }, // Wildcard route (redirect unknown URLs to home)
];
