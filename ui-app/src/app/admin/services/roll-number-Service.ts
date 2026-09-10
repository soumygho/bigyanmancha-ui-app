import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RollNumberAssignmentStatus } from '../../api/models/roll-number-assignment-status';

@Injectable({
  providedIn: 'root',
})
export class RollNumberAssignmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.reportingBaseUrl;

  assignRollNumbers(
    vigyanKendraId: number,
  ): Observable<RollNumberAssignmentStatus> {
    return this.http.get<RollNumberAssignmentStatus>(
      `${this.baseUrl}/api/students/assign-roll-number/${vigyanKendraId}`,
    );
  }

  getAssignmentStatus(
    vigyanKendraId: number,
  ): Observable<RollNumberAssignmentStatus> {
    return this.http.get<RollNumberAssignmentStatus>(
      `${this.baseUrl}/api/students/roll-number-assignment-status/${vigyanKendraId}`,
    );
  }
}
