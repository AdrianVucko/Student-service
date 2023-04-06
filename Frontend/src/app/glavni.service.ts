import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";
import {StudentiSKolegijom} from "./glavna/studentiSKolegijom.model";
import {Kolegij} from "./registracija/kolegij.model";
import {NastavniciSkolegijom} from "./glavna/nastavniciSKolegijom.model";

@Injectable({
  providedIn: 'root'
})
export class GlavniService {

  constructor(private http:HttpClient) { }

  apiRoot = environment.API_URL + '/api/';

  DobiSve(){
    return this.http.get(this.apiRoot).pipe(map((res:any) =>{
      return {status: res['status'],
        nastavnicis: res['nastavnicis'].map((value:any) => {return {jmbg: value['jmbg'],email: value['email'], ime: value['ime'], prezime: value['prezime'], lozinka: value['lozinka'], salt: value['salt'], level:value['level'], svizatog:value['svizatog']}}),
        studentis: res['studentis'].map((value:any) => {return {jmbag: value['jmbag'], ime: value['ime'], prezime: value['prezime'], datumupisa: value['datumupisa'], svizatog: value['svizatog']}}),
        kolegijs: res['kolegijs'].map((value:any) => {return {id:value['id'],naziv:value['naziv'],opis:value['opis'],idSmjer:value['idsmjer'],nazivSmjera:value['druginaziv']}})
      }
    }))
  }

  dodajNovogStudenta(student: StudentiSKolegijom){
    return this.http.post(this.apiRoot,{...student,tip:'student'});
  }

  dodajNoviKolegij(kolegij: Kolegij){
    return this.http.post(this.apiRoot, {...kolegij,tip:'kolegij'})
  }

  dodajNoviKolegijZaTajEntitet(tipEntiteta:string,identity:string,kolegij: number){
    return this.http.post(this.apiRoot+`izmjena/${tipEntiteta}/${identity}`, {idKolegija:kolegij});
  }

  dodajNovogNastavnikaIliStudentaZaTajKolegij(tipEntiteta:string,identity:string,ent:string){
    return this.http.post(this.apiRoot+`izmjena/${tipEntiteta}/${identity}`, {idNastavnikaIliStudenta:ent});
  }

  izmjeniLevelNastavniku(nastavnik: NastavniciSkolegijom){
    return this.http.put(this.apiRoot, {...nastavnik,tipEntite:"Nastavnik"})
  }

  IzmjeniPostojecegStudenta(student: StudentiSKolegijom){
    return this.http.put(this.apiRoot,{...student,tipEntite:"Student"});
  }

  izmjeniPostojeciKolegij(kolegij: Kolegij){
    return this.http.put(this.apiRoot, {...kolegij,tipEntite:"Kolegij"})
  }

  izbrisiPostojecegStudenta(studentJmbag: string){
    return this.http.delete(this.apiRoot+`student/${studentJmbag}`);
  }

  izbrisiPostojeciKolegij(idKolegi: number){
    return this.http.delete(this.apiRoot+`kolegij/${idKolegi}`);
  }

  izbrisiStudentaStogKolegija(jmbag:string,id:number){
    return this.http.delete(this.apiRoot+`izmjena/studenti/${jmbag}/${id}`);
  }

  izbrisiNastavnikaStogKolegija(jmbg:string,id:number){
    return this.http.delete(this.apiRoot+`izmjena/nastavnici/${jmbg}/${id}`);
  }

  izbrisiKolegijSTogNastavnikaIliStudenta(id:string,ide:string){
    return this.http.delete(this.apiRoot+`izmjena/kolegiji/${id}/${ide}`)
  }

  DobiSveZaDetalje(entiteti:string){
    return this.http.get(this.apiRoot+`detalji/${entiteti}`).pipe(map((res:any) =>{
      return {status: res['status'],
        nastavnicis: res['nastavnicis'].map((value:any) => {return {jmbg: value['jmbg'],email: value['email'], ime: value['ime'], prezime: value['prezime'], lozinka: value['lozinka'], salt: value['salt'], level:value['level'], svizatog:value['svizatog']}}),
        studentis: res['studentis'].map((value:any) => {return {jmbag: value['jmbag'], ime: value['ime'], prezime: value['prezime'], datumupisa: value['datumupisa'], svizatog: value['svizatog']}}),
        kolegijs: res['kolegijs'].map((value:any) => {return {id:value['id'],naziv:value['naziv'],opis:value['opis'],idSmjer:value['idsmjer'],nazivSmjera:value['druginaziv']}})
      }
    }))
  }

  IzmjenaGet(entiteti:string, identitet:string|number){
    return this.http.get(this.apiRoot+`izmjena/${entiteti}/${identitet.toString()}`).pipe(map((res:any) =>{
      return {status: res['status'],
        nastavnicis: res['nastavnicis'],
        studentis: res['studentis'],
        kolegijs: res['kolegijs']
      }
    }))
  }
}
