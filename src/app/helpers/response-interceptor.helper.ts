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
import { Observable, throwError, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MyInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Intercept and modify the response
          console.log('Intercepted response:', event);
          // Modify the response or perform other actions
        }
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

