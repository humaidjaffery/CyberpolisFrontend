import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CourseService } from '../course.service';
import { Router } from '@angular/router';
import { error } from 'console';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';

import * as d3 from 'd3'
import * as topojson from 'topojson-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  courses: any[] = [];
  userInfo: any = {}
  speed = 0.02
  mediaCdnUrl = environment.mediaCdnUrl

  courseHover = -1;
  
  windowWidth: number = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }


  constructor(private courseService: CourseService, public router: Router, private authService: AuthService) { }

  ngOnInit(): void {
      this.courseService.getAllCourses().subscribe(
        {
          next: this.populateCourses.bind(this),
          error: this.handleError.bind(this)
        }
      )  

      this.authService.getUserInfo().subscribe({
        next: this.handleUserInfo.bind(this),
        error: this.handleError.bind(this)
      })

      this.createGlobe()
  }

  populateCourses(data: any){
    this.courses = data
    console.log(this.courses)
  }


  goToCourse(courseId: any, courseName: string){
    console.log(courseId)
    this.router.navigate(['/course', courseId, courseName])
  }

  logout(){
    this.authService.logout()
    this.router.navigate(['/auth/login'])
  }

  
  handleError(data: any){
    console.log(data)
  }

  handleUserInfo(data: any){
    console.log(data)
    this.userInfo = data
  }

  @ViewChild('card') card!: ElementRef;

  onMouseMove(event: MouseEvent): void {
    const cardElement = this.card.nativeElement;
    const rect = cardElement.getBoundingClientRect(); // Use bounding rectangle for accuracy

    const cardWidth = rect.width;
    const cardHeight = rect.height;
    const centerX = rect.left + cardWidth / 2;
    const centerY = rect.top + cardHeight / 2;

    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;

    const rotateX = (mouseY / (cardHeight / 2)) * -15; // Adjust for tilt range (-15 to 15 degrees)
    const rotateY = (mouseX / (cardWidth / 2)) * 15;

    cardElement.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  }

  onMouseLeave(): void {
    const cardElement = this.card.nativeElement;
    cardElement.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)`; // Reset rotation
  }

  projection: any;
  svg: any;
  path: any;
  private scale = this.windowWidth / 5

  private createGlobe(): void {
    console.log(this.scale)
    this.svg = d3.select("#globe")
      .append("svg")
      .attr("width", this.scale * 2)
      .attr("height", this.scale * 2);

    this.projection = d3.geoOrthographic() 
      .scale(this.scale)
      .translate([this.scale, this.scale]) 
      .clipAngle(90);

    this.path = d3.geoPath().projection(this.projection); // Use the projection for drawing paths

    const graticule = d3.geoGraticule(); // Adds latitude/longitude lines

    this.svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", this.path)
      .attr("fill", "#ADD8E6");

    this.svg.append("path")
      .datum(graticule)
      .attr("d", this.path)
      .attr("stroke", "#ccc")
      .attr("fill", "none");

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world: any) => {
      const countries = topojson.feature(world, world.objects.countries).features;

      //countries
      this.svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", this.path)
        .attr("fill", (d: any) => {
          if(d.properties.name == "Brazil"){
            return "#B534FF"
          }
          return "#74C476";
        })
        .attr("")

    });

    // Add rotation interaction
    const rotate = () => {
      const t = d3.now() * this.speed;
      this.projection.rotate([t, -10]);

      // Redraw the globe paths (land borders, etc.)
      this.svg.selectAll("path").attr("d", this.path); 
    };

    d3.timer(rotate); // Rotate the globe continuously
  }

  jumpToMostRecent(){
    
  }


  hoverCourse(index: number){
    this.courseHover = index
  }
}
