import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  errorMessage = "";

  constructor(private authService: AuthService, public router: Router) { }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.router.navigate(['home']);
      return;
    }
  }

  onSubmit(data: any){
    this.authService.signup(data.email, data.username, data.password).subscribe(
      (response: any) => {
        console.log(response);
        this.router.navigate(['home']);
      },
      (error: any) => {
        //to do: implement error
        console.log(error);
        this.errorMessage = error.error;

      }
    )
  }

}
