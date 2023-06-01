// onboarding.component.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineStorageService } from '../offline-storage.service';
import { ArchiveService } from '../services/archive.service';
import { StorageService } from '../services/storage.service';
import { LoadResourceService } from '../services/load-resource.service';
import { AuthenticationService } from '../services/authentication.service';
import { CategoryService } from '../services/category.service';
import { SharingService } from '../services/sharing.service';
import { AlertService } from '../services/alert.service';
import * as URL from "../app-url";
import * as CONST from "../app-const";
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  currentScreen = 1;

  constructor(
    private authService: AuthenticationService,
    private loadResourceService: LoadResourceService,
    private storageService: StorageService,
    private archiveService: ArchiveService,
    private categoryService: CategoryService,
    private sharingService: SharingService,
    private offlineStorageService: OfflineStorageService,
    private httpClient: HttpClient,
    private alertService: AlertService,
    private router: Router
  ) { }

  nextScreen(): void {
    this.currentScreen++;
  }

  completeOnboarding = async () => {



    await this.downloadPdfs();
    localStorage.setItem('hasCompletedOnboarding', 'true');

    this.router.navigate(['/home']);
  }


  downloadPdfs = async () => {
    try {
      const archives = await this.archiveService.allOfUser().toPromise();
      console.log(archives);
      archives?.forEach((archive, i) => {
        this.downloadPDF(archive.path, archive.category.slug)
      })
    } catch (e) {
      console.log(e);
      this.alertService.error("Une erreur s'est produite lors du retrait des données")
    }
  }


  downloadPDF(pdf: string, category: string) {

    caches.match(pdf).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("Ce document des deja dans le cache")
        cachedResponse.blob().then((blob) => {
          //saveAs(blob, pdf); // Enregistrer le fichier PDF localement
        });
      } else {
        const options: {
          headers?: HttpHeaders | {
            [header: string]: string | string[];
          };
          observe?: "body";
          params?: HttpParams | {
            [param: string]: string | string[];
          };
          reportProgress?: boolean;
          responseType: "blob";
          withCredentials?: boolean;
        } = {
          headers: {
            'response-type': 'blob',
          },
          params: {
            'pdf': pdf
          },
          responseType: 'blob',
        }

        let url = URL.PDF_RESOURCE;
        url += `?${CONST.IGNORE_LOG_PARAM}=true&category=${category}`;
        this.httpClient.get(url, options).subscribe((response: Blob) => {
          console.log(response)
          caches.open('pdfCache').then((cache) => {
            const cacheResponse = new Response(response);
            cache.put(pdf, cacheResponse);
          });
          //saveAs(response, pdf);  // Specify the desired file name and location
        });

      }
    });
    localStorage.setItem('hasCompletedOnboarding','true')
  }

}
