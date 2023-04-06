import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";
import {Users} from "./logiranje/users.model";
import {HttpClient} from "@angular/common/http";


@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if (this.authService.getToken() !== '') {
        return true;
      }

      if(this.router.url!=='/login' && this.router.url!='/register') this.router.navigate(['login'])

      return false;
    }
}
