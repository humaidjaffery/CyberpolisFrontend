import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HeroComponent } from './hero/hero.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { CourseComponent } from './course/course.component';
import { ModuleComponent } from './module/module.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AceEditorModule } from 'ngx-ace-editor-wrapper';
import { JwtInterceptor } from './jwt.interceptor';
import { LinearRegressionCostComponent } from './interactive/linear-regression-cost/linear-regression-cost.component';

@NgModule({
  declarations: [
    AppComponent,
    HeroComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    CourseComponent,
    ModuleComponent,
    LinearRegressionCostComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule, 
    AceEditorModule 
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([JwtInterceptor])
    ),
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
