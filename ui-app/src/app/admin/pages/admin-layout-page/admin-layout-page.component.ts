import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminMenuBarComponent } from '../../components/admin-menu-bar/admin-menu-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout-page',
  templateUrl: './admin-layout-page.component.html',
  styleUrls: ['./admin-layout-page.component.css'],
  standalone: true,
  imports: [RouterModule, AdminMenuBarComponent, CommonModule]
})
export class AdminLayoutPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
