import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as URL from "./app-url";
import { AuthenticationService } from "./services/authentication.service";
import * as CONST from "./app-const";
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class ArchivesOflineService {
  private dbName = 'ArchivesManager';
  private dbVersion = 1;
  private db: IDBDatabase;


  private ArchiveTable = 'Archives'
  private CategoriesTable = 'Categories'

  private databaseReady: Promise<void>;
  constructor(private httpClient: HttpClient, private authService: AuthenticationService, private router: Router,) {
    this.databaseReady = this.openDatabase();
    this.openDatabase().then(() => {
      console.log('Database is open!');
    });
  }

  private openDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = (event: Event) => {
        console.error('IndexedDB error:', event);
        reject();
      };
      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.ArchiveTable)) {
          db.createObjectStore(this.ArchiveTable, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(this.CategoriesTable)) {
          db.createObjectStore(this.CategoriesTable, { keyPath: 'id' });
        }
      };
    })

  }

  addArchive(archive: any): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.ArchiveTable, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.ArchiveTable);

      const getRequest = objectStore.get(archive.id);

      getRequest.onerror = (event) => {
        console.error('Error checking object existence:');
        reject();
      };

      getRequest.onsuccess = (event) => {
        const existingObject = getRequest.result;
        if (existingObject) {
          resolve((event.target as IDBRequest).result as number); // Object already exists, resolve the promise
        } else {
          // Object doesn't exist, proceed with adding it
          const request: IDBRequest = objectStore.add(archive);

          request.onsuccess = (event: Event) => {
            resolve((event.target as IDBRequest).result as number);
          };

          request.onerror = (event: Event) => {
            reject((event.target as IDBRequest).error);
          };
        }
      };
      transaction.oncomplete = (event: Event) => {
        console.log('archive added successfully');
      };
    });
  }

  getarchive(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.ArchiveTable, 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(this.ArchiveTable);

      const request: IDBRequest = objectStore.openCursor();


      request.onsuccess = (event: Event) => {
        const cursor: IDBCursorWithValue = (event.target as IDBRequest).result;

        if (cursor) {
          const archive: any = cursor.value;

          if (archive.id === id) {
            resolve(archive);
            return;
          }
          cursor.continue();
        } else {
          resolve(undefined);
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('archive retrieved successfully');
      };


    });
  }

  getAllAChives(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.ArchiveTable, 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(this.ArchiveTable);
      const request: IDBRequest = objectStore.openCursor();
      const Archives: any[] = [];

      request.onsuccess = (event: Event) => {
        const cursor: IDBCursorWithValue = (event.target as IDBRequest).result;

        if (cursor) {
          Archives.push(cursor.value);
          cursor.continue();
        } else {
          resolve(Archives);
        }
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('All Archives retrieved successfully');
      };
    });
  }

  getAllAChivesByCategory(categorieId: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.ArchiveTable, 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(this.ArchiveTable);
      const request: IDBRequest = objectStore.openCursor();
      const Archives: any[] = [];

      request.onsuccess = (event: Event) => {
        const cursor: IDBCursorWithValue = (event.target as IDBRequest).result;

        if (cursor) {
          if (cursor.value.category.id == categorieId) {
            Archives.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(Archives);
        }
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('All Archives retrieved successfully');
      };
    });
  }

  updatearchive(archive: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.ArchiveTable, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.ArchiveTable);
      const request: IDBRequest = objectStore.put(archive);

      request.onsuccess = (event: Event) => {
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('archive updated successfully');
      };
    });
  }

  deletearchive(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.ArchiveTable, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.ArchiveTable);
      const request: IDBRequest = objectStore.delete(id);

      request.onsuccess = (event: Event) => {
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('archive deleted successfully');
      };
    });
  }

  addCategorie(Categorie: any): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.CategoriesTable, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.CategoriesTable);
      const request: IDBRequest = objectStore.add(Categorie);

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result as number);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('Categorie added successfully');
      };
    });
  }

  getCategorie(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.CategoriesTable, 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(this.CategoriesTable);

      const request: IDBRequest = objectStore.openCursor();


      request.onsuccess = (event: Event) => {
        const cursor: IDBCursorWithValue = (event.target as IDBRequest).result;

        if (cursor) {
          const archive: any = cursor.value;

          if (archive.id === id) {
            resolve(archive);
            return;
          }
          cursor.continue();
        } else {
          resolve(undefined);
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('archive retrieved successfully');
      };


    });
  }

  clearArchive(): Promise<void> {
    return this.clearTable(this.ArchiveTable);
  }

  clearCategorie(): Promise<void> {
    return this.clearTable(this.CategoriesTable);
  }


  clearTable(tableName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(tableName, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(tableName);
      const request: IDBRequest = objectStore.clear();

      request.onsuccess = (event: Event) => {
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {

      };
    });
  }

  getAllCategories(): Promise<any[]> {
    return this.databaseReady.then(() => {
      return new Promise((resolve, reject) => {

        const transaction: IDBTransaction = this.db.transaction(this.CategoriesTable, 'readonly');
        const objectStore: IDBObjectStore = transaction.objectStore(this.CategoriesTable);
        const request: IDBRequest = objectStore.openCursor();
        const Categories: any[] = [];

        request.onsuccess = (event: Event) => {
          const cursor: IDBCursorWithValue = (event.target as IDBRequest).result;

          if (cursor) {
            Categories.push(cursor.value);
            cursor.continue();
          } else {
            resolve(Categories);
          }
        };

        request.onerror = (event: Event) => {
          reject((event.target as IDBRequest).error);
        };

        transaction.oncomplete = (event: Event) => {
          console.log('All Categories retrieved successfully');
        };
      })
    });
  }

  updateCategorie(Categorie: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.CategoriesTable, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.CategoriesTable);
      const request: IDBRequest = objectStore.put(Categorie);

      request.onsuccess = (event: Event) => {
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('Categorie updated successfully');
      };
    });
  }

  deleteCategorie(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.CategoriesTable, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.CategoriesTable);
      const request: IDBRequest = objectStore.delete(id);

      request.onsuccess = (event: Event) => {
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = (event: Event) => {
        console.log('Categorie deleted successfully');
      };
    });
  }

  downloadPDFAndPutInCache(pdf: string, category: string) {

    caches.match(pdf).then((cachedResponse) => {
      if (cachedResponse) {
        cachedResponse.blob().then((blob) => {

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
        });

      }
    });
  }


  async navigatorOnline(): Promise<boolean> {
    try {
      const headers = { 'SkipInterceptor': 'true' };
      const response = await this.httpClient.get<any>('https://jsonplaceholder.typicode.com/posts/1', { headers }).toPromise();

      if (response) {
        if (!this.authService.isLogged()) {
          this.authService.logout();
        }
        return true;
      } else {
        return false
      }
    } catch (error) {
      return false;
    }

  }
}
