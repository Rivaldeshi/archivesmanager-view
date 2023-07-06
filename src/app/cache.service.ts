import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class CacheService {
  private cacheName = 'myAppCache';

  get(key: string): Observable<any> {
    return from(caches.open(this.cacheName)).pipe(
      switchMap((cache) => from(cache.match(key))),
      switchMap((response) => {
        if (response) {
          return from(response.json());
        } else {
          return of(null);
        }
      })
    );
  }
  async set(key: string, data: any): Promise<void> {
    const cache = await caches.open(this.cacheName);
    const cacheResponse = new Response(JSON.stringify(data));
    await cache.put(key, cacheResponse);
  }

  async remove(key: string): Promise<void> {
    const cache = await caches.open(this.cacheName);
    await cache.delete(key);
  }

  async clear(): Promise<void> {
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      if (name === this.cacheName) {
        await caches.delete(name);
      }
    }
  }
}
