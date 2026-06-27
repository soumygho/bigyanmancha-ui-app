import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminUserGridComponent } from "../../components/admin-user-grid/admin-user-grid.component";

@Component({
  selector: 'app-admin-users-page',
  templateUrl: './admin-users-page.component.html',
  styleUrls: ['./admin-users-page.component.css'],
  standalone: true,
  imports: [CommonModule, AdminUserGridComponent]
})
export class AdminUsersPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
