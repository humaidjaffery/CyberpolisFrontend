import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ModuleService } from '../module.service';


@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent implements OnInit {
  courseName: string = "" 
  courseId: string = ""
  modules: any[] = [] 

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
    this.modules = data
  }

  goToModule(moduleId: String){
    this.router.navigate(['module', moduleId])
  }



}
