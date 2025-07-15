import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminLoginFormComponent } from "../../components/admin-login-form/admin-login-form.component";

@Component({
  selector: 'app-admin-login-page',
  templateUrl: './admin-login-page.component.html',
  styleUrls: ['./admin-login-page.component.css'],
  standalone: true,
  imports: [CommonModule, AdminLoginFormComponent]
})
export class AdminLoginPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
