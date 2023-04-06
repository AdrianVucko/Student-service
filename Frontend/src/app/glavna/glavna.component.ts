import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GlavniService} from "../glavni.service";
import {StudentiSKolegijom} from "./studentiSKolegijom.model";
import {NastavniciSkolegijom} from "./nastavniciSKolegijom.model";
import {Kolegij} from "../registracija/kolegij.model";
import {Sort} from '@angular/material/sort';
import {Router} from "@angular/router";
import {AuthService} from "../auth.service";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {Users} from "../logiranje/users.model";

@Component({
  selector: 'app-glavna',
  templateUrl: './glavna.component.html',
  styleUrls: ['./glavna.component.css']
})
export class GlavnaComponent implements OnInit{

  sviStudenti: StudentiSKolegijom[]= [];
  sviNastavnici: NastavniciSkolegijom[]= [];
  sviKolegiji: Kolegij[]=[];
  kolegijiScekom:any[]=[];
  jmbgZaFilter:string ='';
  jmbagZaFilter: string= '';
  nazivKolegijaZaFilter: string= '';
  pokaziStudent: boolean=false;
  pokaziKolegij: boolean=false;
  noviStudent: StudentiSKolegijom= new StudentiSKolegijom();
  noviKolegij: Kolegij= new Kolegij();
  message: string='';
  messageDva: string= '';
  sviStudentiSIzmjenom: any[]= [];
  sviKolegijiSIzmjenom: any[]= [];
  sviSmjerovi: any[]=[];
  user: Users= new Users();

  constructor(private http: HttpClient, private glavniService: GlavniService, private router : Router, private auth: AuthService) {

  }

  ngOnInit() : void {
    this.http.get(environment.API_URL + '/api/me').pipe(map((res:any)=>{
      return {status:res['status'],user:res['user']};
    })).subscribe(res=> {
      console.log(res)
      this.user= new Users();
      this.user.jmbg=res['user'].jmbg;
      this.user.email=res['user'].email;
      this.user.level=res['user'].level;
      if(this.user.email==='istekao') this.auth.logout();
      this.glavniService.DobiSve()
        .subscribe((value:{status:string,kolegijs:Kolegij[],nastavnicis:NastavniciSkolegijom[],studentis:StudentiSKolegijom[]}) => {
          this.sviKolegiji=value.kolegijs;

          this.sviNastavnici= value.nastavnicis;
          if(this.user.level===2) this.sviNastavnici= this.sviNastavnici.filter(value1 => value1.jmbg===this.user.jmbg);

          this.sviStudenti= value.studentis;
          if(this.user.level===2) this.sviStudenti= this.sviStudenti.filter(value1 => {
            let prolaz=false;
            for(let ind of (this.sviNastavnici[0].svizatog)){
              if(value1.svizatog.includes(ind)) prolaz=true;
            }
            return prolaz;
          })

          this.sviStudenti.forEach(value => {
            this.sviStudentiSIzmjenom.push({...value,izmjena:false})
          })
          this.sviKolegiji.forEach(value => {
            this.kolegijiScekom.push({...value,checked: false});
          })
          this.sviSmjerovi=[...new Map(this.sviKolegiji.map(value1=> [value1['idSmjer'],value1])).values()].map(value1 => {return{idSmjer:value1.idSmjer,nazivSmjera:value1.nazivSmjera}});

          if(this.user.level===2) this.sviKolegiji=this.sviKolegiji.filter(value1 => this.sviNastavnici[0].svizatog.includes(value1.id))
          this.sviKolegiji.forEach(value1 => {
            this.sviKolegijiSIzmjenom.push({...value1,izmjena:false})
          })
        })
    })
  }

  prebaci(tip:string,identifikacija: string|number){
    this.router.navigate(['izmjena', tip, identifikacija.toString()]);
  }

  addClick(){
    this.message='';
    let pass= true;
    if(this.noviStudent.jmbag.length!==10){
      this.message+= "Jmbag mora biti dugačak točno 10 brojeva|";
      pass= false;
    }
    if(this.sviStudenti.find(u => u.jmbag=== this.noviStudent.jmbag) !== undefined){
      this.message+= "Ovaj jmbag već postoji|";
      pass= false;
    }
    if(this.kolegijiScekom.find(u => u.checked===true) === undefined){
      this.message+= "Morate odabrati barem jedan kolegij"
      pass= false;
    }
    if(pass){
      this.noviStudent.svizatog=this.kolegijiScekom.filter(value => value.checked === true).map(value => value.id);
      this.noviStudent.datumupisa=new Date();
      this.glavniService.dodajNovogStudenta(this.noviStudent).subscribe(res => {
        console.log(res);
      });
      this.sviStudentiSIzmjenom.push({...this.noviStudent,izmjena:false});
      this.noviStudent= new StudentiSKolegijom();
      this.kolegijiScekom.forEach(value => {
        value.checked=false;
      })
    }
  }

  addClickKolegij(){
    this.messageDva='';
    let pass= true;
    if(this.sviKolegiji.find(u => u.id=== this.noviKolegij.id) !== undefined){
      this.messageDva+= "Ovaj id već postoji|";
      pass= false;
    }
    if(this.noviKolegij.idSmjer===0){
      this.messageDva+= "Morate odabrati smjer"
      pass= false;
    }
    if(pass){
      this.noviKolegij.nazivSmjera=this.sviSmjerovi.find(value => value.idSmjer===this.noviKolegij.idSmjer).nazivSmjera;
      this.glavniService.dodajNoviKolegij(this.noviKolegij).subscribe(res=>{
        console.log(res);
      })
      this.sviKolegijiSIzmjenom.push({...this.noviKolegij,izmjena:false});
      this.noviKolegij= new Kolegij();
    }
  }

  updejtajLevelNastavniku(nas: NastavniciSkolegijom){
    this.glavniService.izmjeniLevelNastavniku(nas).subscribe(res =>{
      console.log(res);
    });
    this.sviNastavnici= this.sviNastavnici.map(value => {
      if(value.jmbg===nas.jmbg) value.level=1;
      return value;
    })
  }

  izmjeniStudenta(jmbagOdStudenta: string) {
    if(this.sviStudentiSIzmjenom.find(value => value.jmbag===jmbagOdStudenta).izmjena===true){
      this.glavniService.IzmjeniPostojecegStudenta(this.sviStudentiSIzmjenom.find(value => value.jmbag===jmbagOdStudenta)).subscribe(res =>{
        console.log(res);
      });
    }
    this.sviStudentiSIzmjenom.find(value => value.jmbag === jmbagOdStudenta).izmjena=!this.sviStudentiSIzmjenom.find(value => value.jmbag === jmbagOdStudenta).izmjena;
  }

  izbrisiStudenta(jmbaOdStudenta: string){
    this.glavniService.izbrisiPostojecegStudenta(jmbaOdStudenta).subscribe(res =>{
      console.log(res);
    })
    this.sviStudentiSIzmjenom= this.sviStudentiSIzmjenom.filter(value => value.jmbag!==jmbaOdStudenta);
  }

  izmjeniKolegij(idKolegija: number){
    if(this.sviKolegijiSIzmjenom.find(value => value.id===idKolegija).izmjena===true){
      this.glavniService.izmjeniPostojeciKolegij(this.sviKolegijiSIzmjenom.find(value => value.id===idKolegija)).subscribe(res =>{
        console.log(res);
      });
    }
    let stari=this.sviKolegiji.find(value => value.id===idKolegija) as Kolegij;
    this.sviKolegijiSIzmjenom=this.sviKolegijiSIzmjenom.map(value => {
      if(value.nazivSmjera===stari.nazivSmjera) value.nazivSmjera= this.sviKolegijiSIzmjenom.find(value => value.id===idKolegija).nazivSmjera;
      return value
    });
    let novi= this.sviKolegijiSIzmjenom.find(value => value.id===idKolegija);
    this.sviKolegiji=this.sviKolegiji.map(value => {
      if(value.nazivSmjera===stari.nazivSmjera) value.nazivSmjera= novi.nazivSmjera;
      return value;
    })
    this.sviKolegijiSIzmjenom.find(value => value.id===idKolegija).izmjena=!this.sviKolegijiSIzmjenom.find(value => value.id===idKolegija).izmjena;
  }

  izbrisiKolegij(idKolegija: number){
    this.glavniService.izbrisiPostojeciKolegij(idKolegija).subscribe( res=>{
      console.log(res);
    })
    this.sviKolegijiSIzmjenom= this.sviKolegijiSIzmjenom.filter(value => value.id!==idKolegija);
  }

  sortDataStudenti(sort: Sort) {
    const data = this.sviStudentiSIzmjenom.slice();
    if (!sort.active || sort.direction === '') {
      this.sviStudentiSIzmjenom = data;
      return;
    }

    this.sviStudentiSIzmjenom = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'jmbag':
          return this.compare(a.jmbag, b.jmbag, isAsc);
        case 'ime':
          return this.compare(a.ime, b.ime, isAsc);
        case 'prezime':
          return this.compare(a.prezime, b.prezime, isAsc);
        case 'datumUpisa':
          return this.compare(a.datumupisa, b.datumupisa, isAsc);
        default:
          return 0;
      }
    });
  }

  sortDataNastavnici(sort: Sort) {
    const data = this.sviNastavnici.slice();
    if (!sort.active || sort.direction === '') {
      this.sviNastavnici = data;
      return;
    }

    this.sviNastavnici = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'jmbg':
          return this.compare(a.jmbg, b.jmbg, isAsc);
        case 'email':
          return this.compare(a.email, b.email, isAsc);
        case 'imeNastavnika':
          return this.compare(a.ime, b.ime, isAsc);
        case 'prezimeNastavnika':
          return this.compare(a.prezime, b.prezime, isAsc);
        case 'levelNastavnika':
          return this.compare(a.level,b.level, isAsc);
        default:
          return 0;
      }
    });
  }

  sortDataKolegiji(sort: Sort) {
    const data = this.sviKolegijiSIzmjenom.slice();
    if (!sort.active || sort.direction === '') {
      this.sviKolegijiSIzmjenom = data;
      return;
    }

    this.sviKolegijiSIzmjenom = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.compare(a.id, b.id, isAsc);
        case 'naziv':
          return this.compare(a.naziv, b.naziv, isAsc);
        case 'opis':
          return this.compare(a.opis, b.opis, isAsc);
        case 'nazivSmjera':
          return this.compare(a.nazivSmjera, b.nazivSmjera, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  parseDate(dateString: string): Date {
    console.log(new Date(dateString));
    return new Date(dateString);
  }

  resetirajStudenta(){
    this.noviStudent= new StudentiSKolegijom();
    this.kolegijiScekom.forEach(value => {
      value.checked=false;
    });
    this.message='';
  }

  resetirajKolegij(){
    this.noviKolegij= new Kolegij();
    this.messageDva='';
  }
}

