import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Anim1Component } from './anim1/anim1.component';
import { IntroComponent } from './intro/intro.component';

@NgModule({
  declarations: [
    AppComponent,
    Anim1Component,
    IntroComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
