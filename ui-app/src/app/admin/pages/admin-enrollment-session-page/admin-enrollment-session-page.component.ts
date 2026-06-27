import { Component } from '@angular/core';
import { EnrollmentSessionGridComponent } from "../../components/enrollment-session-grid/enrollment-session-grid.component";

@Component({
  selector: 'app-admin-enrollment-session-page',
  standalone: true,
  imports: [EnrollmentSessionGridComponent],
  templateUrl: './admin-enrollment-session-page.component.html',
  styleUrl: './admin-enrollment-session-page.component.css'
})
export class AdminEnrollmentSessionPageComponent {

}
