import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ApiModule } from '../../../api/api.module';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
} from 'ag-grid-community';
import {
  EnrollmentSessionManagementApiService,
  ReportingApiService,
} from '../../../api/services';
import {
  EnrollmentReportingResponse,
  EnrollmentSession,
  UserDetailsResponseDto,
  VigyanKendraDetails,
} from '../../../api/models';
import { StateManagerService } from '../../services/state-manager.service';
import { NotificationService } from '../../services/notification.service';
import { EnrollmentSessionFormComponent } from '../enrollment-session-form/enrollment-session-form.component';
import { ActionCellRendererComponent } from './action-cell-renderer.component';
import { LoggedInUserState } from '../../imports/app-state-import';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-enrollment-reporting-grid',
  standalone: true,
  imports: [
    AgGridModule,
    ApiModule,
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    ActionCellRendererComponent,
  ],
  templateUrl: './enrollment-reporting-grid.component.html',
  styleUrl: './enrollment-reporting-grid.component.css',
})
export class EnrollmentReportingGridComponent implements OnInit, OnDestroy {
  private readonly enrollmentSessionService = inject(
    EnrollmentSessionManagementApiService
  );
  private readonly reportingApiService = inject(ReportingApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);

  readonly userLoggedInState = signal<LoggedInUserState | undefined>(undefined);
  readonly enrollmentSessionFilter = signal<undefined | null | number>(
    undefined
  );
  readonly vigyanKendraFilter = signal<undefined | null | number>(undefined);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);
  //local state
  readonly enrollmentList = signal<EnrollmentSession[]>([]);
  //local state
  readonly data = signal<EnrollmentSession[]>([]);

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef<EnrollmentReportingResponse>[] = [
    { field: 'enrollmentYear', headerName: 'Year', flex: 1 },
    { field: 'vigyanKendraName', headerName: 'Vigyankendra Name', flex: 1 },
    { field: 'vigyanKendraCode', headerName: 'Vigyankendra code', flex: 1 },
    { field: 'reportName', headerName: 'Report Name', flex: 1 },
    {
      field: 'reportDate',
      headerName: 'Date',
      flex: 1,
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      headerName: 'Actions',
      width: 275,
      cellRenderer: ActionCellRendererComponent,
    },
  ];

  gridApi!: GridReadyEvent['api'];

  constructor() {
    effect(
      () => {
        let state = this.globalStateManagerService.globalState();
        if (state && state.vigyanKendras) {
          this.vigyanKendraList.set(state.vigyanKendras);
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnDestroy(): void {
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  ngOnInit(): void {
    let loginState = this.globalStateManagerService.getLoggedInUserState();
    this.userLoggedInState.set(loginState);
    this.loadConfigData();
    this.loadData();
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }

  loadConfigData() {
    this.globalStateManagerService.initializeGlobalState();
    this.enrollmentSessionService
      .getAllEnrollmentSession()
      .subscribe((response) => {
        this.enrollmentList.set(response);
      });
  }

  loadData() {
    this.reportingApiService.getAllReports().subscribe((response) => {
      this.data.set(response);
    });
  }

  generateReport() {
    if (this.enrollmentSessionFilter() && this.vigyanKendraFilter()) {
      this.reportingApiService
        .prepareReport({
          body: {
            enrollmentSessionId: this.enrollmentSessionFilter()!,
            vigyanKendraId: this.vigyanKendraFilter()!,
          },
        })
        .subscribe(() => {
          this.loadData();
        });
    } else {
      this.notificationService.show(
        `Please select both enrollment year and vigyankendra.`
      );
    }
  }

  delete(item: EnrollmentReportingResponse) {
    if (!confirm(`Delete this report?`)) return;
    this.reportingApiService
      .deleteReport({ id: item.id ?? -1 })
      .subscribe(() => {
        this.loadData();
      });
  }

  setVigyanKendraFilter(event: any) {
    const value = event.value;
    this.vigyanKendraFilter.set(value);
  }
  setEnrollemntSessionFilter(event: any) {
    const value = event.value;
    this.enrollmentSessionFilter.set(value);
  }

  onRefresh() {
    this.loadData();
  }

  generateStatisticReport() {
    if (this.enrollmentSessionFilter()) {
      this.reportingApiService
        .prepareStatisticsReport({
          body: {
            enrollmentSessionId: this.enrollmentSessionFilter()!,
            vigyanKendraId: 0,
          },
        })
        .subscribe(() => {
          this.loadData();
        });
    } else {
      this.notificationService.show(`Please select enrollment year.`);
    }
  }
}
