import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { CacheService } from '../cache.service';

@Injectable()
export class OfflineInterceptor implements HttpInterceptor {
  constructor(private cacheService: CacheService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.headers.has('SkipInterceptor')) {
      // Skip interception and proceed with the original request
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {

          if (error.message.includes('https://jsonplaceholder.typicode.com')) {

            // Handle the error silently
            return throwError('');
          } else {
            return throwError(error);
          }
        })
      );
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Cache the response
          const cacheKey = this.generateCacheKey(req);
          this.cacheService.set(cacheKey, event);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ProgressEvent) {
          // Network error occurred, retrieve response from cache if available
          const cacheKey = this.generateCacheKey(req);
          return this.cacheService.get(cacheKey).pipe(
            switchMap(cachedResponse => {
              const fakeResponse = new HttpResponse({
                body: cachedResponse.body,
                headers: cachedResponse.headers,
                status: 200, // Set a desired success status code
                statusText: 'OK' // Set a desired success status text
              });

              if (cachedResponse) {
                console.log('Retrieved response from cache:', cachedResponse);
                return of(fakeResponse);
              } else {
                return throwError(error);
              }
            })
          );

          // const fakeResponse = new HttpResponse({
          //   body: { message: 'This is a transformed response.' },
          //   headers: error.headers,
          //   status: 200, // Set a desired success status code
          //   statusText: 'OK' // Set a desired success status text
          // });

          // // Return the transformed response
          // return of(fakeResponse);
        }
        return throwError(error);
      })
    );
  }



  private generateCacheKey(req: HttpRequest<any>): string {
    const paramsObj: { [param: string]: string | number } = {};

    // Convert request parameters to a plain object
    req.params.keys().forEach(key => {
      paramsObj[key] = req.params.get(key)!;
    });

    // Convert the plain object to a string key-value pairs
    const params = new HttpParams({ fromObject: paramsObj });

    // Combine URL and request parameters to generate a unique cache key
    const urlWithParams = req.urlWithParams.includes('?')
      ? `${req.urlWithParams}&${params.toString()}`
      : `${req.urlWithParams}?${params.toString()}`;

    return urlWithParams;
  }
}
