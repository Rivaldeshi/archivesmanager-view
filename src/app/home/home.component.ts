import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SharingService } from '../services/sharing.service';
import { Category } from '../models/category.model';
import { CategoryService } from '../services/category.service';
import { AlertService } from '../services/alert.service';
import { ArchiveService } from '../services/archive.service';
import { ArchivesOflineService } from '../archives-ofline.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  categories: Array<Category> = [];
  allCategory: Category = new Category();
  interval: any;


  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private archiveService: ArchiveService,
    private archivesOflineService: ArchivesOflineService,
    private sharingService: SharingService,
    private alertService: AlertService) { }

  async ngOnInit() {

    this.allCategory.id = 0;
    this.allCategory.name = 'Toute les catégories';
    this.allCategory.description = 'Une fusion de toute les catégorie';

    this.getData(false);
    this.interval = setInterval(() => {
      this.getData(true);
    }, 1000 * 60 * 5);  //check for new category every five minute
  }


  ngOnDestroy() {
    clearInterval(this.interval);
  }


 async getData(hideLog: boolean) {
    if (await this.archivesOflineService.navigatorOnline()) {
      this.categoryService.getCategories(hideLog).toPromise()
        .then(async (data) => {
          if (data!.length != this.categories.length) {
            //this.categories = data;
            this.categories = [];
            await this.archivesOflineService.clearCategorie();
            data!.forEach(async categ => {
              let tab = await this.archiveService.allOfCategory(categ.id).toPromise();
              if (tab!.length > 0) {
                this.categories.push(categ);

                this.archivesOflineService.addCategorie(categ).then(() => {

                }).catch(e => {
                  console.log(e);
                })
              }
            });
          }
        })
        .catch(err => this.alertService.error("Une erreur s'est produite lors du retrait des données"));
    } else {
      this.archivesOflineService.getAllCategories()
        .then((data) => {
          console.log(data)
          if (data!.length != this.categories.length) {
            //this.categories = data;
            console.log(data);
            this.categories = [];
            data!.forEach(async categ => {
                this.categories.push(categ);
            });
          }
        })
        .catch(err => { console.log(err); this.alertService.error("Une erreur s'est produite lors du retrait des données")});
    }
  }


  goToCategory(category: Category) {
    this.sharingService.setData(category);
    this.router.navigate(['/category']);
  }

}
