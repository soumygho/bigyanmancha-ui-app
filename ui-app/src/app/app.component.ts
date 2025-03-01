import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./common/header/header.component";
import { SidebarComponent } from "./common/sidebar/sidebar.component";
import { FooterComponent } from "./common/footer/footer.component";
import { UpcomingEventComponent } from "./common/upcoming-event/upcoming-event.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, UpcomingEventComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ui-app';
}
