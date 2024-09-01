import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  showLogInToAccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, public router: Router) { }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.router.navigate(['home']);
      return;
    }

    this.route.queryParams.subscribe((params) => {
      if(params['showLogInToAccessMessage'] == 'true'){
        this.showLogInToAccessMessage = true;
      }
    });
  }



  onSubmit(data: any){
    this.showLogInToAccessMessage = false;
    this.authService.login(data.email, data.password).subscribe(
      {
        next: this.handleSuccessfulLogin.bind(this),
        error:  this.handleLoginError.bind(this)
      }
    )
  }

  handleSuccessfulLogin(data: any){
    console.log(data)
    this.router.navigate(['home'])
  }

  handleLoginError(error: any){
    console.log("E" + error)
  }

}
