import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BetaUserForm } from '../models/beta-user-form.model';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  mediaCdnUrl = environment.mediaCdnUrl;
  isLoggedIn: boolean = false;
  betaEmail: string = '';
  betaSubmitted: boolean = false;
  activeFeatureIndex: number = 0;
  showScrollArrow: boolean = true;
  private featureInterval: any;
  private animationsPausedUntilMs: number = 0;

  @ViewChild('beta_signup') targetElementRef: ElementRef;

  // Decorative neon dots in the feature section background
  neonDots: Array<{ x: number; y: number; size: number; color: 'accent' | 'accent2'; durationMs: number; delayMs: number }>= [];

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
    this.setupScrollListener();
    this.startFeatureCycling();
    this.generateNeonDots(28);
  }

  setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.pageYOffset;
      // Hide arrow after scrolling down 100px
      this.showScrollArrow = scrollPosition < 100;
    });
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
    // Reset the auto-cycling when user manually selects a feature
    this.resetFeatureCycling();
    // Pause animations for 10 seconds after manual selection
    this.animationsPausedUntilMs = Date.now() + 10000;
  }

  startFeatureCycling(): void {
    this.featureInterval = setInterval(() => {
      this.activeFeatureIndex = (this.activeFeatureIndex + 1) % this.features.length;
    }, 5000); // Change every 5 seconds
  }

  resetFeatureCycling(): void {
    if (this.featureInterval) {
      clearInterval(this.featureInterval);
      this.startFeatureCycling();
    }
  }

  ngOnDestroy(): void {
    if (this.featureInterval) {
      clearInterval(this.featureInterval);
    }
  }

  getCurrentFeature(): any {
    return this.features[this.activeFeatureIndex];
  }

  isActiveFeature(index: number): boolean {
    return this.activeFeatureIndex === index;
  }

  isNextFeature(index: number): boolean {
    const nextIndex = (this.activeFeatureIndex + 1) % this.features.length;
    return index === nextIndex;
  }

  // Determines gradient direction based on index parity to alternate colors
  isForwardGradient(index: number): boolean {
    // If the next tab should start with the ending color of the current active tab,
    // then alternate direction by parity so adjacent tabs swap start/end colors.
    return index % 2 === 0;
  }

  isAnimationsEnabled(): boolean {
    return Date.now() > this.animationsPausedUntilMs;
  }

  private generateNeonDots(count: number): void {
    const dots: Array<{ x: number; y: number; size: number; color: 'accent' | 'accent2'; durationMs: number; delayMs: number }>= [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100; // percent across width
      const y = Math.random() * 100; // percent down height
      const size = 3 + Math.random() * 4; // 3px to 7px
      const color = Math.random() < 0.5 ? 'accent' : 'accent2';
      const durationMs = 2500 + Math.random() * 3000; // 2.5s - 5.5s
      const delayMs = -Math.random() * 3000; // negative so they start at random phase
      dots.push({ x, y, size, color, durationMs, delayMs });
    }
    this.neonDots = dots;
  }

  gain_early_access(){
    console.log("GAIN EARLY ACCESS CLICKED")
    const betaUserForm = new BetaUserForm();
    betaUserForm.useremail = this.betaEmail; // Only username is valid
    betaUserForm.surveyQuestions = []; // No survey questions on this form

    this.authService.betaUser(betaUserForm).subscribe({
      next: (response) => {
        console.log('Beta user added:', response);
      },
      error: (error) => {
        console.error('Error adding beta user:', error);
      }
    });

    this.router.navigate(['survey']);
  }
}
