import { Component, inject, OnInit, signal } from '@angular/core';
import { StateManagerService } from '../../services/state-manager.service';
import { CommonModule } from '@angular/common';
import { JwtResponse } from '../../../api/models';

@Component({
  selector: 'app-admin-landing-page',
  templateUrl: './admin-landing-page.component.html',
  styleUrls: ['./admin-landing-page.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminLandingPageComponent implements OnInit {
  private globalStateManagerService: StateManagerService = inject(StateManagerService);
  readonly userLoggedInState = signal<JwtResponse | undefined>({});
  readonly isLoggedIn = signal<boolean>(false);

  constructor() { }

  ngOnInit() {
    this.globalStateManagerService.initializeGlobalState();
    let loginState = this.globalStateManagerService.getLoggedInUserState();
    console.trace(loginState);
    this.userLoggedInState.set(loginState.response);
    this.isLoggedIn.set(loginState.isLoggedIn);
  }

}
