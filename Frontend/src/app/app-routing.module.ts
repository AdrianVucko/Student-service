import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LogiranjeComponent} from "./logiranje/logiranje.component";
import {RegistracijaComponent} from "./registracija/registracija.component";
import {GlavnaComponent} from "./glavna/glavna.component";
import {DetaljiComponent} from "./detalji/detalji.component";
import {IzmjenaComponent} from "./izmjena/izmjena.component";
import {AuthenticationGuard} from "./auth.guard";

const routes: Routes = [
  {path: '', component: GlavnaComponent, canActivate:[AuthenticationGuard]},
  {path: 'izmjena/:id/:iddva', component: IzmjenaComponent, canActivate:[AuthenticationGuard]},
  {path: 'detalji/:id', component: DetaljiComponent, canActivate:[AuthenticationGuard]},
  {path: 'login', component: LogiranjeComponent},
  {path: 'register', component: RegistracijaComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
