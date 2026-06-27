import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { EnrollmentSessionManagementApiService } from '../../../api/services';
import { EnrollmentSession, UserDetailsResponseDto } from '../../../api/models';
import { StateManagerService } from '../../services/state-manager.service';
import dialogConfig from '../../imports/grid-config';
import { NotificationService } from '../../services/notification.service';
import { EnrollmentSessionFormComponent } from '../enrollment-session-form/enrollment-session-form.component';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-enrollment-session-grid',
  standalone: true,
  imports: [
    AgGridModule,
    ApiModule,
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './enrollment-session-grid.component.html',
  styleUrl: './enrollment-session-grid.component.css',
})
export class EnrollmentSessionGridComponent {
  private readonly enrollmentSessionService = inject(
    EnrollmentSessionManagementApiService
  );
  private readonly notificationService = inject(NotificationService);
  private dialog: MatDialog = inject(MatDialog);

  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<EnrollmentSession[]>([]);

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef<EnrollmentSession>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'year', headerName: 'Year', flex: 1 },
    { field: 'enrollmentFreezed', headerName: 'EnrollmentFreezed?', flex: 1 },
    {
      field: 'modificationFreezed',
      headerName: 'Modification Freezed?',
      flex: 1,
    },
    { field: 'active', headerName: 'active?', flex: 1 },
    {
      headerName: 'Actions',
      width: 600,
      cellRenderer: (params: any) => `
          <button class="btn btn-primary btn-sm btn-edit"><i class="material-icons">edit</i></button>
          <button class="btn btn-primary btn-sm btn-active">change active status</button>
          <button class="btn btn-primary btn-sm btn-freeze-edit">freeze editing entry</button>
          <button class="btn btn-primary btn-sm btn-freeze-modification">freeze new entry</button>
          <button class="btn btn-danger btn-sm btn-delete"><i class="material-icons">delete</i></button>`,
      onCellClicked: ({ event, data }: any) =>
        this.handleActionClick(event, data),
    },
  ];

  gridApi!: GridReadyEvent['api'];

  constructor() {
    effect(
      () => {
        let state = this.globalStateManagerService.globalState();
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
    this.loadConfigData();
    this.loadData();
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }

  loadConfigData() {
    this.globalStateManagerService.initializeGlobalState();
  }

  loadData() {
    this.enrollmentSessionService
      .getAllEnrollmentSession()
      .subscribe((response) => {
        this.data.set(response);
      });
  }

  create() {
    this.dialog
      .open(EnrollmentSessionFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: undefined,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: EnrollmentSession = {
          ...dto,
        };
        this.enrollmentSessionService
          .createEnrollmentSession({ body: request })
          .subscribe(() => {
            this.loadData();
          });
      });
  }

  edit(item: EnrollmentSession) {
    this.dialog
      .open(EnrollmentSessionFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: any = {
          ...dto,
        };
        this.enrollmentSessionService
          .updateEnrollmentSession({ body: request })
          .subscribe(() => {
            this.loadData();
          });
      });
  }

  delete(item: EnrollmentSession) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.enrollmentSessionService
      .deleteEnrollmentSessionById({ id: item.id ?? -1 })
      .subscribe(() => {
        this.loadData();
      });
  }

  // called from the “Actions” renderer
  private handleActionClick(evt: Event, item: UserDetailsResponseDto) {
    if ((evt.target as HTMLElement).closest('.btn-edit'))
      return this.edit(item);
    if ((evt.target as HTMLElement).closest('.btn-delete'))
      return this.delete(item);
    if ((evt.target as HTMLElement).closest('.btn-active'))
      return this.handleStatusActive(item);
    if ((evt.target as HTMLElement).closest('.btn-freeze-edit'))
      return this.freezeModification(item);
    if ((evt.target as HTMLElement).closest('.btn-freeze-modification'))
      return this.freezeEnrollment(item);
  }

  handleStatusActive(item: EnrollmentSession) {
    let msg = '';
    if (item.active) {
      msg = 'Set as in-active?';
    } else {
      msg = 'Set as active?';
    }
    if (!confirm(msg)) return;
    if (!item.active) {
      this.enrollmentSessionService
        .setEnrollmentSessionAsActive({
          id: item.id!,
        })
        .subscribe(() => {
          this.loadData();
        });
    } else {
      this.enrollmentSessionService
        .setEnrollmentSessionAsInActive({
          id: item.id!,
        })
        .subscribe(() => {
          this.loadData();
        });
    }
  }

  freezeModification(item: EnrollmentSession) {
    let msg = '';
    if (!item.modificationFreezed) {
      msg = 'Freeze Modification?';
    } else {
      msg = 'Un-Freeze Modification?';
    }
    if (!confirm(msg)) return;
    if (!item.modificationFreezed) {
      this.enrollmentSessionService
        .setModificationFreezed({
          id: item.id!,
        })
        .subscribe(() => {
          this.loadData();
        });
    } else {
      this.enrollmentSessionService
        .setModificationUnFreezed({
          id: item.id!,
        })
        .subscribe(() => {
          this.loadData();
        });
    }
  }

  freezeEnrollment(item: EnrollmentSession) {
    let msg = '';
    if (!item.enrollmentFreezed) {
      msg = 'Freeze enrollment?';
    } else {
      msg = 'Un-Freeze enrollment?';
    }
    if (!confirm(msg)) return;
    if (!item.enrollmentFreezed) {
      this.enrollmentSessionService
        .setEnrollmentFreezed({
          id: item.id!,
        })
        .subscribe(() => {
          this.loadData();
        });
    } else {
      this.enrollmentSessionService
        .setEnrollmentUnFreezed({
          id: item.id!,
        })
        .subscribe(() => {
          this.loadData();
        });
    }
  }

  onRefresh() {
    this.loadData();
  }
}
