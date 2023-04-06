import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GlavniService} from "../glavni.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Kolegij} from "../registracija/kolegij.model";
import {NastavniciSkolegijom} from "../glavna/nastavniciSKolegijom.model";
import {StudentiSKolegijom} from "../glavna/studentiSKolegijom.model";
import {Users} from "../logiranje/users.model";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-izmjena',
  templateUrl: './izmjena.component.html',
  styleUrls: ['./izmjena.component.css']
})
export class IzmjenaComponent implements OnInit{

  sviStudenti: StudentiSKolegijom[]= [];
  sviNastavnici: NastavniciSkolegijom[]= [];
  sviKolegiji: Kolegij[]=[];
  sviKolegijiZaOdabir: Kolegij[]=[];
  Odabrani: any;
  idEntiteta: string | null='';
  idIdentiteta: string | number |null='';
  message:string='';
  messageDva:string='';
  messageTri:string='';
  noviKolegij: number=0;
  noviNastavnik: string='';
  noviStudent: string='';
  user: Users= new Users();

  constructor(private http: HttpClient, private glavniService: GlavniService,private route : ActivatedRoute, private router : Router, private auth: AuthService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.idEntiteta = params.get('id');
      this.idIdentiteta= params.get('iddva');
    })
    this.glavniService.IzmjenaGet(this.idEntiteta as string,this.idIdentiteta as string)
      .subscribe((res : {status:string,kolegijs:Kolegij,nastavnicis:NastavniciSkolegijom,studentis:StudentiSKolegijom})=>{
        if(res.status==='NOT OK') this.router.navigate(['']);
        else{
          if(res.kolegijs !== undefined) {
            this.Odabrani = res.kolegijs;
          }
          else if(res.nastavnicis !== undefined) {
            this.Odabrani = res.nastavnicis;
          }
          else {
            this.Odabrani = res.studentis;
          }
        }
        console.log(this.Odabrani);
      })
    this.http.get(environment.API_URL + '/api/me').pipe(map((res:any)=>{
      return {status:res['status'],user:res['user']};
    })).subscribe(res=> {
      this.user= new Users();
      this.user.jmbg=res['user'].jmbg;
      this.user.email=res['user'].email;
      this.user.level=res['user'].level;
      if(this.user.email==='istekao') this.auth.logout();

      this.glavniService.DobiSve()
        .subscribe((value: { status: string; kolegijs: Kolegij[]; nastavnicis: NastavniciSkolegijom[]; studentis: StudentiSKolegijom[]; }) => {
          this.sviKolegiji = value.kolegijs;
          this.sviKolegijiZaOdabir=value.kolegijs;
          this.sviNastavnici = value.nastavnicis;
          this.sviStudenti = value.studentis;

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

  dodajNoviKolegijNaTajEntitet(){
    let prolaz=true;
    if(this.noviKolegij===0){
      this.message='Morate odabrati kolegij'
      prolaz=false;
    }
    if(prolaz){
      this.glavniService.dodajNoviKolegijZaTajEntitet(this.idEntiteta as string,this.idIdentiteta as string,this.noviKolegij).subscribe(res=>{
        console.log(res);
      });
      if(this.user.level===2) this.sviKolegiji.push(this.sviKolegijiZaOdabir.find(value => value.id===this.noviKolegij) as Kolegij)
      this.Odabrani.svizatog.push(this.noviKolegij);
      this.noviKolegij=0;
    }
  }

  dodajNovogNastavnikaNaTajKolegij(){
    let prolaz=true;
    if(this.noviNastavnik===''){
      this.messageDva='Morate odabrati nastavnika'
      prolaz=false;
    }
    if(prolaz){
      this.glavniService.dodajNovogNastavnikaIliStudentaZaTajKolegij(this.idEntiteta as string,this.idIdentiteta as string,this.noviNastavnik).subscribe(res=>{
        console.log(res);
      });
      this.sviNastavnici=this.sviNastavnici.map(value => {
        if(value.jmbg===this.noviNastavnik) value.svizatog.push(this.Odabrani.id);
        return value;
      });
      this.noviNastavnik='';
    }
  }

  dodajNovogStudentaNaTajKolegij(){
    let prolaz=true;
    if(this.noviStudent===''){
      this.messageTri='Morate odabrati studenta'
      prolaz=false;
    }
    if(prolaz){
      this.glavniService.dodajNovogNastavnikaIliStudentaZaTajKolegij(this.idEntiteta as string,this.idIdentiteta as string,this.noviStudent).subscribe(res=>{
        console.log(res);
      });
      this.sviStudenti=this.sviStudenti.map(value => {
        if(value.jmbag===this.noviStudent) value.svizatog.push(this.Odabrani.id)
        return value;
      });
      this.noviStudent='';
    }
  }

  izbrisiNastavnikaSTogKolegija(jmbg:string,idje:number){
    this.glavniService.izbrisiKolegijSTogNastavnikaIliStudenta(idje.toString(),jmbg).subscribe(res=>{
      console.log(res);
    })
    this.sviNastavnici=this.sviNastavnici.map(value => {
      if(value.jmbg===jmbg) value.svizatog=value.svizatog.filter(value1 => value1!==idje);
      return value;
    })
  }

  izbrisiStudentaSTogKolegija(jmbag:string,idje:number){
    this.glavniService.izbrisiKolegijSTogNastavnikaIliStudenta(idje.toString(),jmbag).subscribe(res=>{
      console.log(res);
    })
    this.sviStudenti=this.sviStudenti.map(value => {
      if(value.jmbag===jmbag) value.svizatog=value.svizatog.filter(value1 => value1!==idje);
      return value;
    })
  }

  izbrisiTajKolegijSNastavnika(jmbg:string, id:number){
    this.glavniService.izbrisiNastavnikaStogKolegija(jmbg, id).subscribe(res =>{
      console.log(res);
    })
    this.Odabrani=(this.sviNastavnici.map(value => {
      if(value.jmbg===jmbg) value.svizatog= value.svizatog.filter(value1 => value1!==id)
      return value;
    }).find(value => value.jmbg===jmbg)) as NastavniciSkolegijom;
  }

  izbrisiTajKolegijSStudenta(jmbag:string,id:number){
    this.glavniService.izbrisiStudentaStogKolegija(jmbag, id).subscribe(res =>{
      console.log(res);
    })
    this.Odabrani=(this.sviStudenti.map(value => {
      if(value.jmbag===jmbag) value.svizatog= value.svizatog.filter(value1 => value1!==id)
      return value;
    }).find(value => value.jmbag===jmbag)) as StudentiSKolegijom;
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

  filtracijaKolegijaZaVecPostojece(odaran: any){
    return this.sviKolegijiZaOdabir.filter(value => {
      let pusti=true;
      for(let nr of odaran.svizatog){
        if(nr===value.id) pusti=false;
      }
      return pusti;
    });
  }

  filtarcijaNastavnikaZaVecPostojeceUKolegiju(idje:number){
    return this.sviNastavnici.filter(value => value.svizatog.find(value1 => value1===idje)===undefined).sort((a, b) => {
      const nameA = a.ime.toUpperCase();
      const nameB = b.ime.toUpperCase();
      if (nameA > nameB) {
        return 1;
      }
      if (nameA < nameB) {
        return -1;
      }
      return 0;
    })
  }

  filtarcijaStudenataZaVecPostojeceUKolegiju(idje:number){
    return this.sviStudenti.filter(value => value.svizatog.find(value1 => value1===idje)===undefined).sort((a, b) => {
      const nameA = a.ime.toUpperCase();
      const nameB = b.ime.toUpperCase();
      if (nameA > nameB) {
        return 1;
      }
      if (nameA < nameB) {
        return -1;
      }
      return 0;
    })
  }

  filtracijaKolegijaNas(idje: number){
    return this.sviNastavnici.filter(value => value.svizatog.find(value1 => value1===idje))
  }

  filtrcijaKolegijaStu(idje: number){
    return this.sviStudenti.filter(value => value.svizatog.find(value1 => value1===idje))
  }
}
