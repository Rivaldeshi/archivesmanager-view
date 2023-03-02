import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import { AlertService } from "../services/alert.service";

import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PUBLIC_USER_LOGIN, PUBLIC_USER_PASSWORD } from "../app-const";
import * as CONST from "../app-const";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  publicLoading = false;
  submitted = false;
  showPage = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) {
    let deconnection = this.route.snapshot.queryParams["action"];
    if (this.authenticationService.isLogged()) {
      this.redirect();
    } else if (deconnection) {
      this.showPage = true;
    } else {
      this.publicLogin();
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(3)]],
    });
  }

  redirect() {
    let nextUrl =  localStorage.getItem(CONST.CURRENT_URL_SESSION_VARNAME);
    localStorage.removeItem(CONST.CURRENT_URL_SESSION_VARNAME);

    let returnUrl = this.route.snapshot.queryParams["returnUrl"];
    if (returnUrl) {
      this.router.navigate([returnUrl]);
    } else if(nextUrl){
      this.router.navigate([nextUrl]);
    }else if (this.authenticationService.isAdmin())
      this.router.navigate(["/admin/home"]);
    else this.router.navigate(["/home"]);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  async onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;

    this.authenticationService
      .login(this.f["login"].value, this.f["password"].value)
      .then((loggedIn: boolean) => {
        if (loggedIn) {
          this.redirect();
        } else {
          this.alertService.error("Email ou mot de passe invalide");
        }
      })
      .catch((err) => this.alertService.error("Une erreur est survenue !"))
      .finally(() => {
        this.loading = false;
      });
  }

  publicLogin() {
    this.publicLoading = true;

    this.authenticationService
      .login(PUBLIC_USER_LOGIN, PUBLIC_USER_PASSWORD)
      .then((loggedIn: boolean) => {
        if (loggedIn) {
          this.redirect();
        } else {
          this.alertService.error("La connection anonyme a été désactivé !");
        }
      })
      .catch((err) => this.alertService.error("Une erreur est survenue !"))
      .finally(() => {
        this.loading = false;
      });
  }
}
