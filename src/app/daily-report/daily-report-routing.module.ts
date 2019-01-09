import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DailyReportComponent } from './daily-report/daily-report.component';
import { AddComponent } from './add/add.component'

const routes: Routes = [
  { path: '', redirectTo: 'daily-report'},
  { path: 'daily-report/:startDate/:endDate/:condition',redirectTo: 'daily-report/:startDate/:endDate/:condition'},
  { path: 'daily-report', component: DailyReportComponent},
  { path: 'daily-report/add/:startDate/:endDate/:condition', component: AddComponent}
];

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyReportRoutingModule { }
