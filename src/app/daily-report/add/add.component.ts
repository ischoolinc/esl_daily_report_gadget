import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Parameter } from '../parameter';

interface Student{
  className:string;
  studentID:string;
  studentName:string;
  studentNumber:string;
};

type CurrentType = {
  classID:string,
  className:string,
  studentID:string,
  studentName:string,
  isGoodBehavior:boolean,
  comment:string,
  requiresAttention:boolean,
  needNotifyParent:boolean,
  mailSendSchool:boolean,
  mailSendParent:boolean,
  currentStudent:Student,
  studentList:Map<string,Student>
}

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})

export class AddComponent implements OnInit {
  private parameter: Parameter = new Parameter();
  private contract:Contract;
  private userAccount:string;
  public current:CurrentType = {
    classID:"",
    className:"",
    studentID:"",
    studentName:"",
    isGoodBehavior:false,
    comment:"",
    requiresAttention:false,
    needNotifyParent:false,
    mailSendSchool:false,
    mailSendParent:false,
    currentStudent: {
      className: "",
      studentID: "",
      studentName: "請選擇學生",
      studentNumber: ""
    },
    studentList:new Map()
  };
  public createDate:string;
  public loading:boolean;
  public dataRow:any;
  public classList:Map<string,string> = new Map();
  public classStudentList:Map<string,Array<Student>> = new Map();

  constructor(
      private gadget:GadgetService,
      private route:ActivatedRoute,
      private router:Router
    ) {}

  async ngOnInit() {

    this.route.paramMap.subscribe(params => {
      //console.log(params.get("startDate"));
      this.parameter.startDate = params.get('startDate');
      this.parameter.endDate = params.get('endDate');
      this.parameter.condition = params.get('condition');
    });

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
    this.createDate = year + '-' + month + '-' + date;

    this.contract = await this.gadget.getContract('behavior.daily.report');
    let userInfo = this.contract.getUserInfo;
    this.userAccount = userInfo.UserName;
    // 取得資料
    this.getDataRow();
  }

  async getDataRow(){
    
    this.dataRow = [];
    try {
      this.loading = true;
      
      // 呼叫 service。
      const rsp = await this.contract.send(
        "_.GetAllClassStudent",{}
      );

      if(rsp.Student){
        // 取得資料
        this.dataRow = [].concat(rsp.Student);
        // 資料整理
        this.dataRow.forEach((data) => {

          // 班級資料整理
          if(!this.classList.has(data.ClassID)){
            this.classList.set(data.ClassID,data.ClassName);
          }

          // 班級學生資料整理
          if(!this.classStudentList.has(data.ClassID)){
            this.classStudentList.set(data.ClassID,[]);
          }
          var student:Student = {
            className: data.ClassName,
            studentID: data.StudentID,
            studentName: data.StudentName,
            studentNumber: data.StudentNumber
          };
          this.classStudentList.get(data.ClassID).push(student);

        });
      }
      else{
        this.dataRow = [];
      }
      this.setCurrentClass(this.dataRow[0].ClassID); // 透過classID 設定currentClass
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }
  }

  setCurrentClass(classID:string){
    this.current.classID = classID;
    this.current.className = this.classList.get(classID);
    this.current.currentStudent ={
      className: "",
      studentID: "",
      studentName: "請選擇學生",
      studentNumber: ""
    };
  }

  setCurrentStudent(student:Student){
    this.current.currentStudent = student;
  }

  addSelectedStudent(){
    if(this.current.currentStudent.studentID != ""){
      if(!this.current.studentList.has(this.current.currentStudent.studentID)){
        this.current.studentList.set(this.current.currentStudent.studentID,this.current.currentStudent);
      }
    }
  }

  deleteSelectedStudent(student:Student){
    this.current.studentList.delete(student.studentID);
  }

  clearCurrentData(){
    this.current.isGoodBehavior = false;
    this.current.comment = "";
    this.current.requiresAttention = false;
    this.current.needNotifyParent = false;
    this.current.mailSendSchool = false;
    this.current.mailSendParent = false;
    this.current.studentList = new Map();
  }

  async save(){
    // 資料驗證
    // 驗證表現內容
    if( this.current.comment.trim() == ""){
      alert("請填寫表現內容!");
      return;
    }
    // 驗證選擇學生
    if(this.current.studentList.size == 0){
      alert("請選擇學生!");
      return;
    }
    // 資料整理
    var studentIDs:Array<{StudentID:string}> = new Array();
    this.current.studentList.forEach((student) =>{
      var data:{StudentID:string}={
        StudentID:student.studentID
      };
      studentIDs.push(data);
    });

    var body:{
      TeacherAccount:string;
      CreateDate:string;
      IsGoodBehavior:boolean;
      Comment:string;
      RequiresAttention:boolean;
      StudentIDs:Array<{StudentID:string}>;
    } = {
      TeacherAccount: this.userAccount,
      CreateDate: this.createDate,
      IsGoodBehavior: this.current.isGoodBehavior,
      Comment: this.current.comment,
      RequiresAttention: this.current.requiresAttention,
      StudentIDs:studentIDs
    };
    // 呼叫service
    const rsp = await this.contract.send(
      "_.SetDailyReport",body
    );
    if(rsp.Result){
      alert("資料新增成功!");
      this. router.navigate(['daily-report',
        {
          startDate:this.parameter.startDate,
          endDate:this.parameter.endDate,
          condition:this.parameter.condition
        }
      ]);
      this.clearCurrentData();
    }
  } 
}

