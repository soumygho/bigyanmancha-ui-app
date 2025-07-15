import { Injectable } from '@angular/core';
import { JwtResponse } from '../../api/models';

interface LoggedInUserState {
  response: JwtResponse | undefined;
  isLoggedIn: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  setLoggedInUserState(state: LoggedInUserState) {
    localStorage.setItem('user-info', JSON.stringify(state));
  }

  getLoggedInUserState() {
    const data = localStorage.getItem('user-info');
    return data ? JSON.parse(data) : undefined;
  }
}
