import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArchivesOflineService {
  private dbName = 'myDatabase';
  private dbVersion = 1;
  private db: IDBDatabase;

  private ArchiveTable = 'Archives'
  private CategoriesTable = 'Categories'


  constructor() {
    this.openDatabase();
  }

  private openDatabase(): void {
    const request: IDBOpenDBRequest = indexedDB.open(this.dbName, this.dbVersion);
    request.onerror = (event: Event) => {
      console.error('IndexedDB error:', event);
    };
    request.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(this.ArchiveTable)) {
        db.createObjectStore(this.ArchiveTable, { autoIncrement: true });
      }

      if (!db.objectStoreNames.contains(this.CategoriesTable)) {
        db.createObjectStore(this.CategoriesTable, { autoIncrement: true });
      }
    };


  }

  addArchive(archive: any): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.ArchiveTable, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.ArchiveTable);
      const request: IDBRequest = objectStore.add(archive);

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result as number);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
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
    return this.clearTable(this.CategoriesTable);
  }

  clearCategorie(): Promise<void> {
    return this.clearTable(this.CategoriesTable);
  }


  clearTable(tableName:string): Promise<void> {
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

}
