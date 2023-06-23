import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { StorageService } from './services/storage.service';
import { ArchiveService } from './services/archive.service';
import { LoadResourceService } from './services/load-resource.service';
import { Utils } from "./app-utils";
import { Archive } from './models/archive.model';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { OfflineStorageService } from './offline-storage.service';
import { PUBLIC_USER_LOGIN, PUBLIC_USER_PASSWORD } from './app-const';
import { AlertService } from './services/alert.service';
import { ArchivesOflineService } from './archives-ofline.service';
//import { NavigationRoute } from 'workbox-routing';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {
  groups: any[] = [];
  servers: any;
  display = false;
  percentDone: number = 0;
  kbLoaded: string = "";
  kbNeeded: string = "";
  serverId: number = 0;
  serverLogin: string = "";
  serverPassword: string = "";
  private param: string[] = [];
  showNavBarAndFooter = false;
  private sub: Subscription;
  isPWA: boolean;


  constructor(
    private authService: AuthenticationService,
    private loadResourceService: LoadResourceService,
    private storageService: StorageService,
    private archiveService: ArchiveService,
    private alertService: AlertService,
    private ArchivesOflineService :ArchivesOflineService,
    private offlineStorageService: OfflineStorageService,
    private httpClient: HttpClient,
    private router: Router
  ) { }




 async ngOnInit() {
    this.detectPWA();
    //  this.downloadPdfs();

    if (await this.ArchivesOflineService.navigatorOnline()) {

      console.log('User is online');
    } else {

      console.log('User is offline');
    }
    this.updateNavBarAndFooter();

    this.sub = this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateNavBarAndFooter();
        }else{
          this.updateNavBarAndFooter();
        }
      });

    if (this.isPWA) {
      this.authService
        .login(PUBLIC_USER_LOGIN, PUBLIC_USER_PASSWORD)
        .then((loggedIn: boolean) => {
          console.log(loggedIn)
          if (loggedIn) {
            const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') != null;
            if (!hasCompletedOnboarding) {
              this.router.navigate(['/onboarding']);
            } else {
              this.router.navigate(['/home']);
            }

          } else {
            this.alertService.error("La connection anonyme a été désactivé !");
          }
        })
        .catch((err) => this.alertService.error("Une erreur est survenue !"))


    }

  }

  updateNavBarAndFooter() {
    let bool = document.URL
      && !document.URL.includes('login')
      && !document.URL.includes('forgot-password')

    if (this.showNavBarAndFooter != bool)
      this.showNavBarAndFooter = bool as boolean;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


  export() {
    this.param = [];
    let kbNeeded = 0;
    this.kbNeeded = Utils.getReadableFileSizeString(kbNeeded);
    let list = document.getElementsByClassName("selection-checkbox");

    for (let i = 0, t = list.length; i < t; i++) {
      let elt = <HTMLInputElement>list[i];
      if (elt.checked) {
        let eltId = parseInt(elt.name);
        this.groups.forEach(async g => {
          if (g.id == eltId) {
            let archives = await this.archiveService.allOfGroup(g.id).toPromise();

            archives?.forEach((a: Archive) => {
              if (this.param.indexOf(a.path) < 0) {
                this.param.push(a.path);
                kbNeeded += parseInt(a.size);
                this.kbNeeded = Utils.getReadableFileSizeString(2 * kbNeeded);
              }
            });
          }
        });
      }
    }
    this.kbNeeded = Utils.getReadableFileSizeString(kbNeeded);
    this.exportFiles();
  }

  exportFiles() {
    this.loadResourceService
      .exportToZip(this.param)
      .subscribe((event: HttpEvent<any>) => {
        ;
        switch (event.type) {
          case HttpEventType.Sent:
            break;
          case HttpEventType.ResponseHeader:
            break;
          case HttpEventType.UploadProgress:
            break;
          case HttpEventType.DownloadProgress:
            this.kbLoaded = Utils.getReadableFileSizeString(event.loaded);
            if (event.total) {
              this.percentDone = Math.round((100 * event.loaded) / event.total);
              this.kbNeeded = Utils.getReadableFileSizeString(event.total);
            } else {
              this.percentDone = 99;
              this.kbNeeded = "";
            }
            break;
          case HttpEventType.Response:
            this.downloadBlob(event.body);
        }
      });
  }

  downloadBlob(blob: Blob) {
    const d = new Date();
    const user = this.authService.getUser();
    let zipFileName =
      "export_of_" +
      user.login +
      "_D_" +
      d.getDate() +
      "-" +
      (d.getMonth() + 1) +
      "-" +
      d.getFullYear() +
      "_T_" +
      d.getTime();
    zipFileName += ".zip";
    Utils.download(blob, zipFileName);
  }

  async replicate() {
    await this.storageService
      .replicate(
        this.serverId,
        this.serverLogin,
        this.serverPassword
      );
  }

  onClose(event: Event) {
    this.authService.logout();
  }

  detectPWA() {
    const mediaQuery = '(display-mode: standalone)';
    if (window.matchMedia && window.matchMedia(mediaQuery).matches) {
      this.isPWA = true;
    } else {
      this.isPWA = false;
    }
  }



}
