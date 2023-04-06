import {EventEmitter, Injectable} from '@angular/core';
import {Users} from "./logiranje/users.model";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {Observable, Subject} from "rxjs";
import {UsersService} from "./users.service";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";

@Injectable()
export class AuthService {

  private user : Users | null = null;
  private token: string | null = null;
  errorEmitter : Subject<string> = new Subject<string>();
  authChange : Subject<boolean> = new Subject<boolean>();
  authUrl : string = environment.API_URL+'/authenticate';

  constructor(private http : HttpClient, private router : Router) { }

  login(credentials : {email : string, password: string}){

    this.http.post(this.authUrl,credentials).pipe(map((res:any) => {
      return {status:res['status'],description:res['description'],user:res['user'],token:res['token']};
    }))
      .subscribe((res : {status : number, description : string, user : Users, token : string}) => {
        console.log(res);
        if (res.status == 200){
          this.user=res.user;
          this.token=res.token;
          localStorage.setItem('token', this.token);
          this.authChange.next(true);
          this.router.navigate(['/']);
        } else {
          this.errorEmitter.next(res.description)
        }
      })
  }

  logout(){
    this.user=null;
    this.token=null;
    localStorage.removeItem('token');
    this.authChange.next(false);
    this.router.navigate(['login']);
  }

  getUser(){
    if (this.user)
      return {...this.user};
    else {return {...(new Users())}}
  }


  isAuthenticated(){
    return (this.user!=null && (this.user.email!='' && this.user.level!=0 && this.user.jmbg!=''));
  }

  getToken(){

    if (this.token) return this.token;
    else {
      if (localStorage.getItem('token')){
        this.token=localStorage.getItem('token');
        return this.token as string;
      }
      else {
        return "" as string;
      }
    }

  }

  whoAmI() : any{

    if (this.getToken() !=='') {

      return this.http.get(environment.API_URL + '/api/me').pipe(map((res:any)=>{
        return {status:res['status'],user:res['user']};
      })).subscribe(res=> {
        console.log(res)
        this.user= new Users();
        this.user.jmbg=res['user'].jmbg;
        this.user.email=res['user'].email;
        this.user.level=res['user'].level;
      })

    } else {
      return new Observable(observer => {
        observer.next({status:100})
      })
    }

  }
}
