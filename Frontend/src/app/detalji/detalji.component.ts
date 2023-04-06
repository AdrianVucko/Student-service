import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GlavniService} from "../glavni.service";
import {StudentiSKolegijom} from "../glavna/studentiSKolegijom.model";
import {NastavniciSkolegijom} from "../glavna/nastavniciSKolegijom.model";
import {Kolegij} from "../registracija/kolegij.model";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {Users} from "../logiranje/users.model";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-detalji',
  templateUrl: './detalji.component.html',
  styleUrls: ['./detalji.component.css']
})
export class DetaljiComponent implements OnInit{

  sviStudenti: StudentiSKolegijom[]= [];
  sviNastavnici: NastavniciSkolegijom[]= [];
  sviKolegiji: Kolegij[]=[];
  idEntiteta: string | null='';
  nazivNastavnikaZaFilter:string ='';
  nazivStudentaZaFilter: string= '';
  nazivKolegijaZaFilter: string= '';
  user: Users= new Users();

  constructor(private http: HttpClient, private glavniService: GlavniService, private route : ActivatedRoute, private router : Router, private auth: AuthService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.idEntiteta = params.get('id');
    })
    this.http.get(environment.API_URL + '/api/me').pipe(map((res:any)=>{
      return {status:res['status'],user:res['user']};
    })).subscribe(res=> {
      console.log(res)
      this.user= new Users();
      this.user.jmbg=res['user'].jmbg;
      this.user.email=res['user'].email;
      this.user.level=res['user'].level;
      if(this.user.email==='istekao') this.auth.logout();

      this.glavniService.DobiSveZaDetalje(this.idEntiteta as string)
        .subscribe((value:{status:string,kolegijs:Kolegij[],nastavnicis:NastavniciSkolegijom[],studentis:StudentiSKolegijom[]}) => {
          this.sviKolegiji=value.kolegijs;
          this.sviNastavnici= value.nastavnicis;
          this.sviStudenti= value.studentis;

          if(this.user.level===2) this.sviNastavnici= this.sviNastavnici.filter(value1 => value1.jmbg===this.user.jmbg);
          if(this.user.level===2) this.sviStudenti= this.sviStudenti.filter(value1 => {
            let prolaz=false;
            for(let ind of (this.sviNastavnici[0].svizatog)){
              if(value1.svizatog.includes(ind)) prolaz=true;
            }
            return prolaz;
          });
          if(this.user.level===2) this.sviKolegiji=this.sviKolegiji.filter(value1 => this.sviNastavnici[0].svizatog.includes(value1.id));
        })
    })
  }

  filtracijaKolegijaNas(idje: number){
    return this.sviNastavnici.filter(value => value.svizatog.find(value1 => value1===idje))
  }

  filtrcijaKolegijaStu(idje: number){
    return this.sviStudenti.filter(value => value.svizatog.find(value1 => value1===idje))
  }

  filtracijaNastavnikaKol(idje: number[]){
    return this.sviKolegiji.filter(value => {
      let ostavi=false;

      for(let idj of idje){
        if(idj===value.id) ostavi=true;
      }

      return ostavi;
    })
  }

  prebaci(tip:string,identifikacija: string|number){
    this.router.navigate(['izmjena', tip, identifikacija.toString()]);
  }
}
