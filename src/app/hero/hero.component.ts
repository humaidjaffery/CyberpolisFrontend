import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {
  mediaCdnUrl = environment.mediaCdnUrl;
  isLoggedIn: boolean = false;
  betaEmail: string = '';
  betaSubmitted: boolean = false;
  activeFeatureIndex: number = 0;

  features = [
    {
      title: 'Modular Learning',
      description1: 'Bite-sized modules for rapid learning',
      description2: 'Master concepts step by step'
    },
    {
      title: 'Interactive Learning',
      description1: 'Dynamic graphs and hands-on exercises',
      description2: 'See algorithms in action'
    },
    {
      title: 'Built-in IDE',
      description1: 'Code, test, and debug in your browser',
      description2: 'No setup required'
    },
    {
      title: 'AI Tutor',
      description1: 'Personal AI companion with memory',
      description2: '24/7 hyper-personalized guidance'
    },
    {
      title: 'Immersive Story',
      description1: 'Learn while saving humanity',
      description2: 'Dystopian future narrative experience'
    }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  scrollToFeatures(): void {
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToBeta(): void {
    const betaElement = document.getElementById('beta');
    if (betaElement) {
      betaElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  joinBeta(): void {
    if (this.betaEmail && this.betaEmail.trim() !== '') {
      // Here you would typically send the email to your backend
      // For now, we'll just show a success message
      this.betaSubmitted = true;
      
      // Reset form after a delay
      setTimeout(() => {
        this.betaSubmitted = false;
        this.betaEmail = '';
      }, 3000);
      
      console.log('Beta signup:', this.betaEmail);
    }
  }

  // Navigation methods
  goToLogin(): void {
    this.router.navigate(['auth/login']);
  }

  goToSignup(): void {
    this.router.navigate(['auth/signup']);
  }

  goToHome(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['auth/login']);
    }
  }

  setActiveFeature(index: number): void {
    this.activeFeatureIndex = index;
  }

  getCurrentFeature(): any {
    return this.features[this.activeFeatureIndex];
  }

  isActiveFeature(index: number): boolean {
    return this.activeFeatureIndex === index;
  }
} 
