import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Users} from "./logiranje/users.model";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http:HttpClient) { }

  apiRoot = environment.API_URL + '/authenticate/';

  getUsersRegistracija(){
    return this.http.get(this.apiRoot+'register').pipe(map((res:any) => {
      return {status:res['status'],
        usersi:res['usersi'].map((value:any) => {return {jmbg:value['jmbg'],password:value['lozinka'],name:value['ime'],email:value['email'],salt:value['salt'],surname:value['prezime'],level:value['level']}}),
        kolegijs: res['kolegijs'].map((value:any) => {return {id:value['id'],naziv:value['naziv'],opis:value['opis'],idSmjer:value['idsmjer'],nazivSmjera:value['druginaziv']}})};
    }));
  }
  getUsersLogin(){
    return this.http.get(this.apiRoot+'login').pipe(map((res:any) => {
      return {status:res['status'],usersi:res['usersi'].map((value:any) => {return {jmbg:value['jmbg'],password:value['lozinka'],name:value['ime'],email:value['email'],salt:value['salt'],surname:value['prezime'],level:value['level']}})};
    }));
  }

  addUser(user: Users, listaIdeva: number[]){
    return this.http.post(this.apiRoot+'register',
      {jmbg: user.jmbg, password: user.password, email: user.email, name: user.name, surname: user.surname, kolegijsi: listaIdeva});
  }
}
