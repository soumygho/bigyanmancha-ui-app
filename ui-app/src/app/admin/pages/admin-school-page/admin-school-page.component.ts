import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SchoolDetailsGridComponent } from "../../components/school-details-grid/school-details-grid.component";

@Component({
  selector: 'app-admin-school-page',
  templateUrl: './admin-school-page.component.html',
  styleUrls: ['./admin-school-page.component.css'],
  standalone: true,
  imports: [CommonModule, SchoolDetailsGridComponent]
})
export class AdminSchoolPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
