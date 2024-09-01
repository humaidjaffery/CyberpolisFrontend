import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent implements OnInit {
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  
  
  constructor (private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.route.params.subscribe({
      next: this.getCourseInfo.bind(this)
    })
  }

  getCourseInfo(routeInfo: any){
    console.log(routeInfo['course_id'])
  }



}
