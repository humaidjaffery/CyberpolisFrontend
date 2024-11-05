import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ModuleService } from '../module.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent implements OnInit {
  mediaCdnUrl = environment.mediaCdnUrl
  courseName = "" 
  courseId = ""
  modules: any[];
  modulesStarted = 0;
  modulesFinished = 0;

  constructor (private route: ActivatedRoute, private moduleService: ModuleService, private router: Router) {}
  
  ngOnInit(): void {
    this.route.params.subscribe({
      next: this.getCourseId.bind(this)
    })

    this.moduleService.getAllFromCourse(this.courseId).subscribe(
      {
        next: this.handleCourseInfo.bind(this),
        error: this.handleError.bind(this)
      }
    )
  }

  getCourseId(routeInfo: any){
    this.courseId = routeInfo['course_id']
    this.courseName = routeInfo['course_name']
  }

  handleError(error: any){
    console.log(error)
  }

  handleCourseInfo(data: any){
    console.log(data)
    this.modules = data
    const courseMap = new Map<string, object>();
    for(let i=0; i<data.length; i++){
      console.log()
      if(data[i] != null){
        courseMap.set(data[i].moduleId, data[i])
        if(data[i].previous == null){
          this.modules[0] = data[i]
          console.log("first")
          console.log(this.modules[0])
        }
      }
    }

    let i=0;
    while(this.modules[i].next != null){
      console.log("hello")
      this.modules[i+1] = courseMap.get(this.modules[i].next)
      i++ 
    }
  }

  goToModule(moduleId: string){
    this.router.navigate(['module', moduleId])
  }



}
