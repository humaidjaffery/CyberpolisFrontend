import { Component, OnInit } from '@angular/core';
import { CourseService } from '../course.service';
import { Router } from '@angular/router';
import { error } from 'console';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  courses: any[] = [];

  constructor(private courseService: CourseService, public router: Router, private authService: AuthService) { }

  ngOnInit(): void {
      this.courseService.getAllCourses().subscribe(
        {
          next: this.populateCourses.bind(this),
          error: this.handleError.bind(this)
        }
      )  
  }

  populateCourses(data: any){
    console.log(data)
    this.courses = data
  }

  handleError(data: any){
    console.log(data)
  }

  goToCourse(courseId: any, courseName: String){
    console.log(courseId)
    this.router.navigate(['/course', courseId, courseName])
  }


  logout(){
    this.authService.logout()
  }


}
