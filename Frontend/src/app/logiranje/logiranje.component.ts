import {Component, OnInit, Input} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Users} from "./users.model";
import {filter, map, pairwise} from "rxjs/operators"
import {FormBuilder, FormGroup} from "@angular/forms";
import {UsersService} from "../users.service";
import {AuthService} from "../auth.service";
import {Router, RoutesRecognized} from "@angular/router";

@Component({
  selector: 'app-logiranje',
  templateUrl: './logiranje.component.html',
  styleUrls: ['./logiranje.component.css']
})
export class LogiranjeComponent implements OnInit{

  users: Users[]= [];
  user: Users= new Users();
  message: string= '';

  constructor(private http: HttpClient, private fb: FormBuilder, private userService: UsersService, private auth : AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.userService.getUsersLogin()
      .subscribe((res : {status: string, usersi:Users[]}) => {
        this.users=res.usersi;
        this.users.forEach(value => console.log(value));
      });
  }

  onLogin(){
    this.message="";
    let prolaz=true;
    if(this.users.find(u => u.email===this.user.email) === undefined) {
      this.message="Email ne postoji";
      prolaz=false;
    }
    if(prolaz) {
      this.auth.login({email: this.user.email, password: this.user.password});
    }
  }

  preb(){
    if(this.auth.isAuthenticated()) this.router.navigate([''])
  }
}
