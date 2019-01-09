import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren:'./daily-report/daily-report.module#DailyReportModule' }
  //{ path: '', loadChildren: './home/home.module#HomeModule' },
  //{ path: 'daily-report', loadChildren:'./daily-report/daily-report.module#DailyReportModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
