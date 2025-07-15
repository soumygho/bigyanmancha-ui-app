import { Component, effect, inject, OnInit } from '@angular/core';
import { StateManagerService } from '../../services/state-manager.service';
import { StudentEnrollmentGridComponent } from '../../components/student-enrollment-grid/student-enrollment-grid.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-student-page',
  templateUrl: './admin-student-page.component.html',
  styleUrls: ['./admin-student-page.component.css'],
  standalone: true,
  imports: [StudentEnrollmentGridComponent, CommonModule],
})
export class AdminStudentPageComponent implements OnInit {
  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);
  readonly globalState = this.globalStateManagerService.globalState;
  constructor() {
    effect(() => {
      let state = this.globalState();
      console.log(state);
    });
  }

  ngOnInit() {}
}
