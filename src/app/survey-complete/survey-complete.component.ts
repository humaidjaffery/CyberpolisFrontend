import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-survey-complete',
  templateUrl: './survey-complete.component.html',
  styleUrl: './survey-complete.component.css'
})
export class SurveyCompleteComponent implements OnInit {
  ngOnInit(): void {
    console.log("in survey compelte")
  }
  mediaCdnUrl = environment.mediaCdnUrl;

}
