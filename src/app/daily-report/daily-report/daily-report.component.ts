import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GadgetService, Contract } from 'src/app/gadget.service';
import { Parameter } from 'src/app/daily-report/parameter';

interface condition{
  key:string,
  value:string
}

@Component({
  selector: 'app-daily-report',
  templateUrl: './daily-report.component.html',
  styleUrls: ['./daily-report.component.css']
})
export class DailyReportComponent implements OnInit {

  loading:boolean;
  startDate:string;
  endDate:string;
  currentCondition:condition;
  conditionList = new Map([
    ['All','全校紀錄'],
    ['MyClass','我的班級'],
    ['MyRecord','我的紀錄']
  ]);
  dataRow:any;
  dataList:any;
  private parameter:Parameter = new Parameter();
  private userAccount:string;
  private contract:Contract;
  
  constructor(
    private gadget:GadgetService,
    private route:ActivatedRoute
    ) {}

  async ngOnInit() {

    this.contract = await this.gadget.getContract('behavior.daily.report');
    let userInfo = this.contract.getUserInfo;
    this.userAccount = userInfo.UserName;

    this.route.paramMap.subscribe(params => {
      this.parameter.startDate = params.get('startDate');
      this.parameter.endDate = params.get('endDate');
      this.parameter.condition = params.get('condition');
    });

    if(this.parameter.startDate != undefined){
      this.startDate = this.parameter.startDate;
      this.endDate = this.parameter.endDate;
      this.currentCondition = {
        key: this.parameter.condition,
        value: this.conditionList.get(this.parameter.condition)
      }
    }
    else{
      let today = new Date();
      let year = today.getFullYear();
      let month = ''+ (today.getMonth() + 1);
      let date = '' + today.getDate();

      if(today.getDate() < 10){
        date = '0' + date;
      }
      if((today.getMonth() + 1) < 10){
        month = '0' + month;
      }
      this.startDate = year + '-' + month + '-' + date;
      this.endDate = year + '-' + month + '-' + date;

      let keys = Array.from(this.conditionList.keys());
      this.currentCondition = {
        key: keys[0],
        value: this.conditionList.get(keys[0])
      };
    }
    
    this.reloadData();
  }

  setCurrentCondition(key:string){
    let cd:condition = {
      key: key,
      value: this.conditionList.get(key)
    };
    this.currentCondition = cd;
    this.reloadData();
  }

  async reloadData(){
    this.dataRow = [];
    try {
      this.loading = true;
      
      // 呼叫 service。
      const rsp = await this.contract.send(
        "_.GetDailyReport",
        {
          Request: {
            StartDate: this.startDate,
            EndDate: this.endDate,
            Condition: this.currentCondition.key,
            UserAccount: this.userAccount
          }
        }
      );
      
      if(rsp.Result){
        this.dataRow = [].concat(rsp.Result);
      }
      else{
        this.dataRow = [];
      }

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  addBtnClick(){
    this.parameter.startDate = this.startDate;
    this.parameter.endDate = this.endDate;
    this.parameter.condition = this.currentCondition.key;
  }
}
