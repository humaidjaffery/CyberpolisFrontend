import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  errors = ""

  constructor(private authService: AuthService, public router: Router) { }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.router.navigate(['home']);
      return;
    }
  }

  onSubmit(data: any){
    if(data.email == ''){
      this.errors = "Email field can not be blank"
      return
    }

    if(data.password == ''){
      this.errors = "Password field can not be blank"
      return
    }

    this.authService.signup(data.email, data.username, data.password).subscribe(
      {
        next: this.handleSuccessfulSignup.bind(this),
        error: this.handleSignupError.bind(this)
      }
    )
  }

  handleSuccessfulSignup(data: any){
    console.log(data)
    this.router.navigate(['home'])
  }

  handleSignupError(error:any){
    this.errors = error.message
    console.log(error)
  }

}
