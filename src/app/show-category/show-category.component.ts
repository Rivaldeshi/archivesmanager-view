import { Component, OnInit } from "@angular/core";
import { Category } from "../models/category.model";
import { SharingService } from "../services/sharing.service";
import { ArchiveService } from "../services/archive.service";
import { MetadataService } from "../services/metadata.service";
import { AuthenticationService } from "../services/authentication.service";
import { Utils } from "../app-utils";
import { CategoryService } from "../services/category.service";
import { AlertService } from "../services/alert.service";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import * as URL from "../app-url";
import * as CONST from "../app-const";
import { saveAs } from 'file-saver';

@Component({
	selector: "app-show-category",
	templateUrl: "./show-category.component.html",
	styleUrls: ["./show-category.component.scss"]
})
export class ShowCategoryComponent implements OnInit {
	category: Category = new Category;
	archiveFilter: any = {
		name: "",
		categorie: "",
		date: "",
		size: "",
		archivistName: ""
	};
	archives: any[] | undefined = [];
	allCategories: string[] = [];
	private static GROUP_SESSION_NAME: string = "current_category";

	canDownload = false;
	canDelete = false;

	//used by view
	p:any;

	constructor(
		private sharingService: SharingService,
		private archiveService: ArchiveService,
		private metadataService: MetadataService,
		private categoryService: CategoryService,
		private alertService: AlertService,
    private httpClient: HttpClient,
		private authService: AuthenticationService
	) {}

	async ngOnInit() {
		this.authService.hasPrivilege(13).then(bool => {
			this.canDownload = bool;
		});

		this.authService.hasPrivilege(15).then(bool => {
			this.canDelete = bool;
		});

		this.category = this.sharingService.getData<Category>();
		if(this.category == null){
			this.category = new Category();
			this.category.id = 0;
			this.category.name = 'Toute les catégories';
			this.category.description = 'Une fusion de toute les catégorie';
		}

		if (this.category.id === 0) {
			this.categoryService
				.getCategories()
				.toPromise()
				.then((data: Category[]|undefined) => {
					data!.forEach(category => {
						this.allCategories.push(category.name);
					});
				})
				.catch(err =>
					this.alertService.error(
						"Une erreur est survenue lors du retrait des données"
					)
				);
		} else {
			this.allCategories.push(this.category.name);
		}

		if (this.category) {
			sessionStorage.setItem(
				ShowCategoryComponent.GROUP_SESSION_NAME,
				JSON.stringify(this.category)
			);
		} else {
			this.category = JSON.parse(
				sessionStorage.getItem(ShowCategoryComponent.GROUP_SESSION_NAME)!
			);
		}

		if (!this.category) {
			this.category = new Category();
			this.category.id = 0;
			this.category.name = "Toute les catégories";
			this.category.description = "Une fusion de toute les catégories";
		}

		if (this.category.id > 0)
			this.archives = await this.archiveService
				.allOfCategory(this.category.id)
				.toPromise();
		else this.archives = await this.archiveService.allOfUser().toPromise();

		this.setUpArchives();
	}

	private async setUpArchives() {
		this.archives!.forEach(async (a, i) => {
			a.size = Utils.getReadableFileSizeString(a.size);
			a.date = new Date(a.createdAt).toLocaleDateString();
			a.categorie = a.category.name;
			let metadataValues = await this.metadataService
				.getMetadataValues(a.id)
				.toPromise();
			metadataValues!.forEach(mv => {
				let name = mv.metadata.name,
					val = mv.value;
				a[name] = val;
			});
		});
	}

	onDateFilterChange(val:any) {
		if (val !== null && val !== undefined && val !== "") {
			let d = new Date(val);
			this.archiveFilter.date = d.toLocaleDateString();
		} else {
			this.archiveFilter.date = "";
		}
	}

	download(archive:any) {
    //console.log(archive);
	//	this.archiveService.download(archive, archive.name + ".pdf");
    this.downloadPDF(archive.path, archive.category.slug)
	}


	delete(archive:any) {
		this.archiveService.delete(archive.id).subscribe(() => {
			this.archives!.forEach((a, i) => {
				if (a.id === archive.id) {
					this.archives!.splice(i, 1);
				}
			});
		});
	}


  downloadPDF(pdf: string, category: string) {

    caches.match(pdf).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("Ce document des deja dans le cache")
        cachedResponse.blob().then((blob) => {
          saveAs(blob, pdf); // Enregistrer le fichier PDF localement
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
          saveAs(response, pdf);  // Specify the desired file name and location
        });
      }
    });
  }

}

