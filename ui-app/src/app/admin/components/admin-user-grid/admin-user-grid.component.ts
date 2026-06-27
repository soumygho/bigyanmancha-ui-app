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
import { UserManagementApiService } from '../../../api/services';
import {
  SignupRequest,
  UserDetailsResponseDto,
  VigyanKendraDetails,
} from '../../../api/models';
import { StateManagerService } from '../../services/state-manager.service';
import dialogConfig from '../../imports/grid-config';
import { AdminUserFormComponent } from '../admin-user-form/admin-user-form.component';
import { NotificationService } from '../../services/notification.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-admin-user-grid',
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
  templateUrl: './admin-user-grid.component.html',
  styleUrl: './admin-user-grid.component.css',
})
export class AdminUserGridComponent {
  private readonly userDetailsService = inject(UserManagementApiService);
  private readonly notificationService = inject(NotificationService);
  private dialog: MatDialog = inject(MatDialog);

  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<UserDetailsResponseDto[]>([]);
  readonly vigyanKendraFilter = signal<undefined | null | number>(undefined);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);

  readonly filteredItems = computed(() => {
    let filteredData = [];
    if (this.vigyanKendraFilter()) {
      filteredData = this.data().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    } else {
      filteredData = this.data();
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  readonly filteredUserList = computed(() => {
    let filteredData: UserDetailsResponseDto[] = [];
    if (this.vigyanKendraFilter()) {
      filteredData = this.data().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef<UserDetailsResponseDto>[] = [
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'admin', headerName: 'Admin?', flex: 1 },
    { field: 'vigyanKendraName', headerName: 'Vigyan Kendra', flex: 1 },
    { field: 'vigyanKendraCode', headerName: 'Vigyan kendra code', flex: 1 },
    {
      headerName: 'Actions',
      width: 150,
      cellRenderer: (params: any) => `
          <button class="btn btn-primary btn-sm btn-edit"><i class="material-icons">edit</i></button>
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
    this.userDetailsService.getAllUsers().subscribe((response) => {
      this.data.set(response);
    });
  }

  create() {
    this.dialog
      .open(AdminUserFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: undefined,
          vigyanKendraList: [...this.vigyanKendraList()],
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: SignupRequest = {
          ...dto,
          roles: [dto.role]
        };
        this.userDetailsService
          .registerUser({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateSchoolData();
            this.loadData();
          });
      });
  }

  edit(item: UserDetailsResponseDto) {
    if (this.validateAdminUser(item)) {
      return;
    }
    this.dialog
      .open(AdminUserFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
          vigyanKendraList: [...this.vigyanKendraList()],
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: any = {
          id: item.id,
          name: dto.name,
          vigyanKendraId: dto.vigyanKendraId,
        };
        this.userDetailsService.updateUser({ body: request }).subscribe(() => {
          this.globalStateManagerService.mutateSchoolData();
          this.loadData();
        });
      });
  }

  delete(item: UserDetailsResponseDto) {
    if (this.validateAdminUser(item)) {
      return;
    }
    if (!confirm(`Delete "${item.username}"?`)) return;
    this.userDetailsService.deleteUser({ id: item.id ?? -1 }).subscribe(() => {
      this.globalStateManagerService.mutateSchoolData();
      this.loadData();
    });
  }

  // called from the “Actions” renderer
  private handleActionClick(evt: Event, item: UserDetailsResponseDto) {
    if ((evt.target as HTMLElement).closest('.btn-edit'))
      return this.edit(item);
    if ((evt.target as HTMLElement).closest('.btn-delete'))
      return this.delete(item);
  }

  setVigyanKendraFilter(event: any) {
    const value = event.value;
    //reset school filter
    this.vigyanKendraFilter.set(value);
  }

  onRefresh() {
    this.vigyanKendraFilter.set(undefined);
    this.loadData();
  }

  private validateAdminUser(item: UserDetailsResponseDto) {
    if (item.username && item.username === 'master') {
      this.notificationService.show("you cann't modify or delete admin user!");
      return true;
    }
    return false;
  }
}
