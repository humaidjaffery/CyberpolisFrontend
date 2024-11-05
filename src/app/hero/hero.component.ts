import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import * as THREE from 'three'
import { environment } from '../../environments/environment';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {
  mediaCdnUrl = environment.mediaCdnUrl
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  isLoggedIn: boolean;
  modelURL = 'assets/scene.gltf' 

  text = "Creating New Anonymous User just for you..."

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.text = "Redirecting you now..."
    }, 2500)

    setTimeout(() => {
      this.authService.guestUser().subscribe({
        next: this.redirectGuestUser.bind(this),
        error: this.handleError.bind(this)
      })
    }, 4000)
  }

  redirectGuestUser(data){
    this.router.navigate(['home'])
  }

  handleError(error){
    console.log(error)
  }

  

} 
