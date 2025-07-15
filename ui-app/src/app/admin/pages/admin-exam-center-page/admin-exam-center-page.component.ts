import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ExamCenterGridComponent } from "../../components/exam-center-grid/exam-center-grid.component";

@Component({
  selector: 'app-admin-exam-center-page',
  templateUrl: './admin-exam-center-page.component.html',
  styleUrls: ['./admin-exam-center-page.component.css'],
  standalone: true,
  imports: [CommonModule, ExamCenterGridComponent]

})
export class AdminExamCenterPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
