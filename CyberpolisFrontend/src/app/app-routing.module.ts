import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HeroComponent } from './hero/hero.component';
import { AuthGuard } from './authGuard';
import { HomeComponent } from './home/home.component';
import { CourseComponent } from './course/course.component';
import { ModuleComponent } from './module/module.component';

const routes: Routes = [
  {path: 'auth', children: [
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
  ]},
  {path: '', component: HeroComponent},
  {path: 'home', component: HomeComponent},
  {path: ':course_id', component: CourseComponent},
  {path: ':course_id/:module_id', component: ModuleComponent},
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
