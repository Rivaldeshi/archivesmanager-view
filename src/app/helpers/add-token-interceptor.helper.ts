import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from "../services/authentication.service";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AddTokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService){}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (this.authService.isLogged() && !request.headers.get('Authorization')) {
      request = request.clone({
				setHeaders: {
					Authorization: `Bearer ${this.authService.getAccessToken()}`
        },
        withCredentials: false
			});
    }
    return next.handle(request);
  }
}
