import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private readonly databaseName = 'my-database';
  private readonly storeName = 'user-actions';
  private readonly downloadedFiles = 'downloadedFiles';

  private db: Promise<IDBDatabase>;

  constructor() {
    this.db = this.openDatabase();
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.databaseName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { autoIncrement: true });
        }
      };

      request.onsuccess = (event: Event) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = () => {
        reject('Failed to open the database');
      };
    });
  }

  public addAction(action: any): Promise<void> {
    return this.db.then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        const request = store.add(action);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject('Failed to add action to offline storage');
        };
      });
    });
  }

  public storeNameofDonloadedFile(filename: string, fileId: any): Promise<void> {
    return this.db.then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.downloadedFiles, 'readwrite');
        const store = transaction.objectStore(this.downloadedFiles);

        const request = store.add({ filename, fileId });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject('Failed to add action to offline storage');
        };
      });
    });
  }


  public checkIfFileisAlraydiDownloaded(filename: string): Promise<boolean> {
    return this.db.then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.downloadedFiles, 'readwrite');
        const store = transaction.objectStore(this.downloadedFiles);

        const request = store.getAll()

        request.onsuccess = () => {
          resolve(false);
        };

        request.onerror = () => {
          reject('Failed to add action to offline storage');
        };
      });
    });
  }


  public flushActions(): Promise<void> {
    return this.db.then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject('Failed to clear actions from offline storage');
        };
      });
    });
  }

  public getActions(): Promise<any[]> {
    return this.db.then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const actions: any[] = request.result;
          resolve(actions);
        };

        request.onerror = () => {
          reject('Failed to retrieve actions from offline storage');
        };
      });
    });
  }
}
