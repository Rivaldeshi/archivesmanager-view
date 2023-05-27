// onboarding.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  currentScreen = 1;

  nextScreen(): void {
    this.currentScreen++;
  }

  completeOnboarding(): void {
    // Perform actions to indicate onboarding completion,
    // such as storing a flag in local storage or on a server.
  }
}
