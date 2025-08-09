import { environment } from './../../../../environments/environment';
import { Component, effect, inject, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { StateManagerService } from '../../services/state-manager.service';
import { LoggedInUserState } from '../../imports/app-state-import';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-action-cell-renderer',
  imports: [CommonModule],
  template: `
    <a *ngIf="isDownloadable" [href]="linkUrl" target="_blank" rel="noopener noreferrer" class="m-1">
      Download report
    </a>
    <button
      *ngIf="canDelete"
      class="btn btn-danger btn-sm btn-delete"
      (click)="onDelete()"
    >
      <i class="material-icons">delete</i>
    </button>
  `,
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {
  params: any;
  canDelete = false;
  isDownloadable = false;
  linkUrl: string = '';
  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);
  readonly userLoggedInState = signal<LoggedInUserState | undefined>(undefined);
  constructor() {
    let loginState = this.globalStateManagerService.getLoggedInUserState();
    this.userLoggedInState.set(loginState);
  }

  agInit(params: any): void {
    this.params = params;
    this.canDelete = this.userLoggedInState()?.isAdminUser!;
    this.isDownloadable = this.params.data.status === 'COMPLETED';
    this.linkUrl = `${environment.apiBaseUrl}/api/reporting/download/${this.params.data.vigyanKendraCode}/${this.params.data.reportKey}`;
  }

  refresh(params: any): boolean {
    return false;
  }

  onDelete() {
    this.params.context.componentParent.delete(this.params.data);
  }
}
