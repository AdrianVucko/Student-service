import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Users} from "../logiranje/users.model";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{

  authenticated:boolean=false;

  constructor(private auth: AuthService) {
  }

  ngOnInit(): void {
    this.auth.whoAmI()
  }

  jerAutenticiran(){
    return this.authenticated=this.auth.isAuthenticated();
  }

  logout(){
    this.auth.logout();
  }

}
