import { Component, OnInit } from '@angular/core';
import { EnrollmentReportingGridComponent } from '../../components/enrollment-reporting-grid/enrollment-reporting-grid.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-reporting-page',
  templateUrl: './admin-reporting-page.component.html',
  styleUrls: ['./admin-reporting-page.component.css'],
  imports: [EnrollmentReportingGridComponent, CommonModule],
})
export class AdminReportingPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
