import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-users-page',
  templateUrl: './admin-users-page.component.html',
  styleUrls: ['./admin-users-page.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminUsersPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
