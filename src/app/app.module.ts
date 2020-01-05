import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Anim1Component } from './components/anim1/anim1.component';
import { IntroComponent } from './components/intro/intro.component';
import { DrawingToolComponent } from './components/drawing-tool/drawing-tool.component';
import { AcceptPhotoComponent } from './components/accept-photo/accept-photo.component';
import { SelectPrintPhotosComponent } from './components/select-print-photos/select-print-photos.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';

@NgModule({
  declarations: [
    AppComponent,
    Anim1Component,
    IntroComponent,
    DrawingToolComponent,
    AcceptPhotoComponent,
    SelectPrintPhotosComponent,
    ErrorPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
