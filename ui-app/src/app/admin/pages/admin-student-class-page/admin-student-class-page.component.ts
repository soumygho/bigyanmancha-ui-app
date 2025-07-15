import { Component, OnInit } from '@angular/core';
import { StudentClassGridComponent } from "../../components/student-class-grid/student-class-grid.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-student-class-page',
  templateUrl: './admin-student-class-page.component.html',
  styleUrls: ['./admin-student-class-page.component.css'],
  standalone: true,
  imports: [StudentClassGridComponent, CommonModule]
})
export class AdminStudentClassPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
