import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VigyanKendraGridComponent } from "../../components/vigyan-kendra-grid/vigyan-kendra-grid.component";

@Component({
  selector: 'app-admin-vigyan-kendra-page',
  templateUrl: './admin-vigyan-kendra-page.component.html',
  styleUrls: ['./admin-vigyan-kendra-page.component.css'],
  standalone: true,
  imports: [CommonModule, VigyanKendraGridComponent]
})
export class AdminVigyanKendraPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
