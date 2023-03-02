import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import { AlertService } from "../services/alert.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.scss"],
})
export class LogoutComponent implements OnInit {
  newLogin = false;
  constructor(
    private authService: AuthenticationService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.logout();
    let newLogin = this.route.snapshot.queryParams["newLogin"];

    if (newLogin == "false") {
      this.alertService.info("You have been successfully logged out");
    }
  }
}
