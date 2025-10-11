import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { BetaUserForm } from '../models/beta-user-form.model';

@Component({
  selector: 'app-beta-survey',
  templateUrl: './beta-survey.component.html',
  styleUrl: './beta-survey.component.css'
})
export class BetaSurveyComponent implements OnInit {
    mediaCdnUrl = environment.mediaCdnUrl;
    selectedCalculusLevel: number = 0;
    selectedStatisticsLevel: number = 0;
    selectedLinearAlgebraLevel: number = 0;
    name: string = '';
    age: number = 0;
    schoolingLevel: string = '';
    mlExperience: string = '';
    country: string = '';
    suggestions: string = '';
    pythonExperience: string = '';
    pythonLibrariesExperience: string[] = [];

    useremail : string = '';
    showEmailError: boolean = false;

    ngOnInit(): void {
      this.useremail = localStorage.getItem('beta_email') || '';
      console.log(this.useremail)
    }

    constructor (private authService:AuthService, private router: Router) {  }

    selectCalculusLevel(level: number): void {
      this.selectedCalculusLevel = level;
    }

    selectStatisticsLevel(level: number): void {
      this.selectedStatisticsLevel = level;
    }


    selectLinearAlgebraLevel(level: number): void {
      this.selectedLinearAlgebraLevel = level;
    }

    selectPythonExperience(experience: string): void {
      this.pythonExperience = experience;
      console.log(this.pythonExperience)
    }

    selectPythonLibrary(library: string): void {
      if (this.pythonLibrariesExperience.includes(library)) {
        this.pythonLibrariesExperience = this.pythonLibrariesExperience.filter(item => item !== library);
      } else {
        this.pythonLibrariesExperience.push(library);
      }
    }

    selectSchoolingLevel(level: string): void {
      this.schoolingLevel = level;
    }

    onSubmit(): void {
      if (this.useremail === '') {
        this.showEmailError = true;
        return;
      }

      this.showEmailError = false;

      const betaUserForm = new BetaUserForm();
      betaUserForm.useremail = this.useremail;
      betaUserForm.surveyQuestions = [
        this.selectedCalculusLevel.toString(),
        this.selectedStatisticsLevel.toString(),
        this.selectedLinearAlgebraLevel.toString(),
        this.age.toString(),
        this.schoolingLevel,
        this.mlExperience,
        this.country,
        this.suggestions,
        this.pythonExperience,
        this.pythonLibrariesExperience.join(',')
      ];

      console.log("in submit")

      this.authService.betaUser(betaUserForm).subscribe(response => {
        console.log('Beta user added:', response);
      });
      
      this.router.navigate(['survey/complete']);

      console.log('Form Data:', betaUserForm);
    }
}
