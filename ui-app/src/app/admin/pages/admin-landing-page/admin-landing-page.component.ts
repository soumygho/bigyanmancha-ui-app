import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { StateManagerService } from '../../services/state-manager.service';
import { CommonModule } from '@angular/common';
import { LoggedInUserState } from '../../imports/app-state-import';


@Component({
  selector: 'app-admin-landing-page',
  templateUrl: './admin-landing-page.component.html',
  styleUrls: ['./admin-landing-page.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AdminLandingPageComponent implements OnInit {
  private globalStateManagerService: StateManagerService =
    inject(StateManagerService);
  readonly userLoggedInState = signal<LoggedInUserState | undefined>(undefined);
  readonly isLoggedIn = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    this.globalStateManagerService.initializeGlobalState();
    let loginState = this.globalStateManagerService.getLoggedInUserState();
    this.userLoggedInState.set(loginState);
    this.isLoggedIn.set(loginState.isLoggedIn);
  }
}
