import { Component, OnInit, Input } from '@angular/core';
import { LoadResourceService } from '../services/load-resource.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss']
})
export class CoverComponent implements OnInit {


  imageToShow: any;
  isImageLoading: boolean;
  @Input() customClass: string = '';
  @Input() alt: string;
  @Input() cover: string;
  @Input() category: string;

  constructor(private loadResourceService: LoadResourceService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.getImageFromService(this.cover);
  }


  private createImageFromBlob(image: Blob) {
    let reader = new FileReader();

    reader.addEventListener("load", () => {
      this.imageToShow = this.sanitizer.bypassSecurityTrustUrl(reader.result!.toString());
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }


  async getImageFromService(cover: string) {
    this.isImageLoading = true;
    caches.match(cover).then((cachedResponse) => {
      if (cachedResponse) {
        cachedResponse.blob().then((blob) => {
          this.createImageFromBlob(blob as Blob); // Enregistrer le fichier PDF localement
        });
      } else {
        this.loadResourceService.loadCover(cover, this.category).toPromise()
          .then(
            data => {
              this.createImageFromBlob(data as Blob);
              caches.open('pdfCache').then((cache) => {
                const cacheResponse = new Response(data);
                cache.put(cover, cacheResponse);
              });
            }
          )
          .catch(
            error => console.error(error)
          )
          .finally(
            () => { this.isImageLoading = false; }
          );
      }
    });
  }
}
