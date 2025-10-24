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
    
    // Survey Questions Array - 14 elements in order of form appearance


    surveyQuestions: any[] = [
        '', // 0: Python Experience
        '', // 1: Python Libraries (comma-separated)
        0,  // 2: Calculus Level
        0,  // 3: Statistics Level  
        0,  // 4: Linear Algebra Level
        '', // 5: ML Projects Interest
        '', // 6: Study Methods
        '', // 7: Math Interest
        '', // 8: Name
        0,  // 9: Age
        '', // 10: Schooling Level
        '', // 11: ML Experience
        '', // 12: Country
        ''  // 13: Suggestions
    ];


    // Helper array for Python Libraries (for multiple selection)
    pythonLibrariesExperience: string[] = [];

    useremail : string = '';
    showEmailError: boolean = false;

    ngOnInit(): void {
      this.useremail = localStorage.getItem('beta_email') || '';
      console.log("In betasurveyhtml:", this.useremail)
    }

    constructor (private authService:AuthService, private router: Router) {  }

    selectCalculusLevel(level: number): void {
      this.surveyQuestions[2] = level;
    }

    selectStatisticsLevel(level: number): void {
      this.surveyQuestions[3] = level;
    }

    selectLinearAlgebraLevel(level: number): void {
      this.surveyQuestions[4] = level;
    }

    selectPythonExperience(experience: string): void {
      this.surveyQuestions[0] = experience;
      console.log(this.surveyQuestions[0]);
    }

    selectPythonLibrary(library: string): void {
      if (this.pythonLibrariesExperience.includes(library)) {
        this.pythonLibrariesExperience = this.pythonLibrariesExperience.filter(item => item !== library);
      } else {
        this.pythonLibrariesExperience.push(library);
      }
      // Update the survey questions array with comma-separated libraries
      this.surveyQuestions[1] = this.pythonLibrariesExperience.join(',');
    }

    selectSchoolingLevel(level: string): void {
      this.surveyQuestions[10] = level;
    }

    onSubmit(): void {
      if (this.useremail === '') {
        this.showEmailError = true;
        return;
      }

      this.showEmailError = false;

      console.log(this.surveyQuestions)

      const betaUserForm = new BetaUserForm();
      betaUserForm.useremail = this.useremail;
      betaUserForm.surveyQuestions = this.surveyQuestions.map(item => item.toString());

      this.authService.betaUser(betaUserForm).subscribe(response => {
        console.log('Beta user added:', response);
      });
      
      this.router.navigate(['survey/complete']);

      console.log('Form Data:', betaUserForm);
    }
}
