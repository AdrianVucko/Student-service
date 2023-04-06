import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private auth:AuthService){}

    intercept(request : HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {

        const token = this.auth.getToken();

        if (token){

            const copiedReq = request.clone({
                params : request.params.set('token',this.auth.getToken())
            });

            return next.handle(copiedReq);

        } else {
            return next.handle(request);
        }



    }

}
