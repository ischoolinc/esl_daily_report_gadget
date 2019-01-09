import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DailyReportComponent } from './daily-report/daily-report.component';
import { AddComponent } from './add/add.component';

import { DailyReportRoutingModule } from './daily-report-routing.module';

@NgModule({
  imports: [
    CommonModule,
    DailyReportRoutingModule,
    FormsModule,
  ],
  declarations: [
    DailyReportComponent,
    AddComponent
  ]
})
export class DailyReportModule { }
