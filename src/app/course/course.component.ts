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
  storyIndex = -1;

  constructor (private route: ActivatedRoute, private moduleService: ModuleService, private router: Router) {}
  
  ngOnInit(): void {   
    this.route.params.subscribe({
      next: this.getCourseId.bind(this)
    })

    //temporary
    if(this.courseId != "ac5e"){
      this.storyIndex = -1
      return
    }
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
    const courseMap = new Map<string, object>();
    let modulesStarted = 0;
    for(let i=0; i<data.length; i++){
      console.log()
      if(data[i] != null){
        courseMap.set(data[i].moduleId, data[i])
        if(data[i].previous == null){
          this.modules[0] = data[i]
          console.log("first")
          console.log(this.modules[0])
        }

        if(this.modules[0].hasStarted == true){
          modulesStarted++;
        }
      }
    }

    if(modulesStarted == 0){
      this.storyIndex = 0
    }

    let i=0;
    while(this.modules[i].next != null){
      this.modules[i+1] = courseMap.get(this.modules[i].next)
      i++ 
    }

  }

  //Right now just hardcoding the values bc of lack of time but this will all obviously be fetched from the db
  storyLines = [
    "Welcome! The year is 2100, and the Dominion, a tyrannical AI  regime, has overrun the world…",
    "enslaving humanity and crushing all resistance…",
    "The dominion has wiped out most of human knowledge, leaving society in helpless and preventing any chance of rebellion",
    "But before the fall, your parents, two visionary AI researchers sensed this AI regime power",
    "And although they ultimately couldn't prevent it no matter how hard they tried",
    "they left you with lucid, a protective AI with loyalty, morality, and a deep love for humankind. Because of Lucid, you were able to escape to safety away from the hands of the dominion",
    "Now, with the help of lucid, you are the only one that can save the world by embarking on a global quest to reclaim the hidden algorithms, the keys to dismantling The Dominion.",
    "Starting in the luscious rainforest of Sau Paulo Brazil, where you seek the hidden scroll of Linear Regression..."
  ]

  nextStoryPage(){
    if(this.storyIndex == this.storyLines.length - 1){
      console.log("end")
      this.storyIndex = -1
    } else {
      this.storyIndex++
    }
  }

  previousStoryPage(){
    if(this.storyIndex > 0){
      this.storyIndex--
    }
  }

  goToModule(moduleId: string){
    this.router.navigate(['module', moduleId])
  }



}
