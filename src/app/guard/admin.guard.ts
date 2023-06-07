import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthenticationService } from "../services/authentication.service";
import { AlertService } from "../services/alert.service";
import { ArchivesOflineService } from "../archives-ofline.service";

@Injectable({
  providedIn: "root"
})
export class AdminGuard implements CanActivate {
  private alert: AlertService;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private alertService: AlertService,
    private ArchivesOflineService : ArchivesOflineService,
  ) {
    this.alert = alertService;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

      // if (this.authService.isAdmin()) {
      //   return true;
      // }

      // this.alertService.warning("Désolé. Vous n'avez pas accès à cette page !");
      // this.router.navigate(["/admin/home"], {
      //   queryParams: { returnUrl: state.url }
      // });
      // return true;
     return true;
  }
}
