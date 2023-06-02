import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { AlertService } from '../services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private alert: AlertService
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private alertService: AlertService
  ) {
    this.alert = alertService;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (navigator.onLine) {
      if (this.authService.isLogged()) {
        // logged in so return true
        return true;
      }

      // not logged in so redirect to login page with the return url
      this.alertService.warning("Vous devez être connecté avant d'accéder à cette page!");
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url, action: true } });
      return false;
    } else {
      return true;
    }
  }
}
