import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OAuth2LoginComponent } from './oauth2-login/oauth2-login.component';
import { OAuth2CallbackComponent } from './oauth2-callback/oauth2-callback.component';
import { OAuth2Service } from './oauth2.service';

@NgModule({
  declarations: [
    OAuth2LoginComponent,
    OAuth2CallbackComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'callback', component: OAuth2CallbackComponent }
    ])
  ],
  exports: [
    OAuth2LoginComponent,
    OAuth2CallbackComponent
  ],
  providers: [
    OAuth2Service
  ]
})
export class OAuth2Module { }

