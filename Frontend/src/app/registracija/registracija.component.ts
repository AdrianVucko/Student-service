import {Component, OnInit} from '@angular/core';
import {Users} from "../logiranje/users.model";
import {NgForm} from "@angular/forms";
import {UsersService} from "../users.service";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {Kolegij} from "./kolegij.model";

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit{
  user: Users= new Users();
  useri: Users[]= [];
  kolegiji: Kolegij[]= [];
  kolegijiScekom:any[]=[];
  check: string= '';
  message: string= '';

  constructor(private userService: UsersService,private auth : AuthService, private router : Router) {
  }

  ngOnInit(): void {
    this.userService.getUsersRegistracija()
      .subscribe((res : {status:string, usersi:Users[], kolegijs:Kolegij[]}) => {
        this.useri= res.usersi;
        this.kolegiji= res.kolegijs;
        this.useri.forEach(value => console.log(value));
        this.kolegiji.forEach(value => {
          console.log(value);
          this.kolegijiScekom.push({...value,checked: false})
        });
      })
  }

  addClick(usera: Users){
    this.message='';
    let pass= true;
    if(this.user.jmbg.length!==13){
      this.message+= "Jmbg mora biti dugačak točno 13 brojeva|";
      pass= false;
    }
    if(this.useri.find(u => u.jmbg=== this.user.jmbg) !== undefined){
      this.message+= "Ovaj jmbg već postoji|";
      pass= false;
    }
    if(this.useri.find(u => u.email===this.user.email) !== undefined) {
      this.message+= "Ovaj email već postoji|";
      pass= false;
    }
    if(this.check !== this.user.password) {
      this.message+= "Lozinke moraju biti iste|";
      pass= false;
    }
    if(this.kolegijiScekom.find(u => u.checked===true) === undefined){
      this.message+= "Morate odabrati barem jedan kolegij"
      pass= false;
    }
    if(pass){
      let listaIdeva= this.kolegijiScekom.filter( value => value.checked===true).map(value => value.id);
      this.userService.addUser(usera,listaIdeva)
        .subscribe(res => {
          console.log(res);
        });
      this.router.navigate(['login']);
    }
  }

  preb(){
    if(this.auth.isAuthenticated()) this.router.navigate([''])
  }
}
