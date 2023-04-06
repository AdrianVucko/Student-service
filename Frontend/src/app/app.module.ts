import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {LogiranjeComponent} from "./logiranje/logiranje.component";
import {RegistracijaComponent} from "./registracija/registracija.component";
import {FormsModule} from "@angular/forms";
import {AuthService} from "./auth.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { GlavnaComponent } from './glavna/glavna.component';
import {FilterPipe} from "./glavna/filter.pipe";
import {MatSortModule} from "@angular/material/sort";
import { DetaljiComponent } from './detalji/detalji.component';
import { NavbarComponent } from './navbar/navbar.component';
import { IzmjenaComponent } from './izmjena/izmjena.component';
import {AuthInterceptor} from "./auth.interceptor";
import {AuthenticationGuard} from "./auth.guard";

@NgModule({
  declarations: [
    AppComponent,
    LogiranjeComponent,
    RegistracijaComponent,
    GlavnaComponent,
    FilterPipe,
    DetaljiComponent,
    NavbarComponent,
    IzmjenaComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    MatSortModule
  ],
  providers: [AuthService, AuthenticationGuard, {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi:true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
