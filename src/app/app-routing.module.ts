import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Anim1Component } from './components/anim1/anim1.component';
import { IntroComponent } from './components/intro/intro.component';
import { DrawingToolComponent } from './components/drawing-tool/drawing-tool.component';
import { AcceptPhotoComponent } from './components/accept-photo/accept-photo.component';
import { SelectPrintPhotosComponent } from './components/select-print-photos/select-print-photos.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { InfoPageComponent } from './components/info-page/info-page.component';


const routes: Routes = [
  { path: '', redirectTo: '/intro', pathMatch: 'full' },
  { path: 'intro', component: IntroComponent },
  { path: 'anim1/:id', component: Anim1Component },
  { path: 'drawing', component: DrawingToolComponent },
  { path: 'accept-photo', component: AcceptPhotoComponent },
  { path: 'select-print-photos', component: SelectPrintPhotosComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: 'info', component: InfoPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
