import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Anim1Component } from './components/anim1/anim1.component';
import { IntroComponent } from './components/intro/intro.component';
import { DrawingToolComponent } from './components/drawing-tool/drawing-tool.component';
import { AcceptPhotoComponent } from './components/accept-photo/accept-photo.component';
import { SelectPrintPhotosComponent } from './components/select-print-photos/select-print-photos.component';


const routes: Routes = [
  { path: 'intro', component: IntroComponent },
  { path: 'anim1/:id', component: Anim1Component },
  { path: 'drawing', component: DrawingToolComponent },
  { path: 'accept-photo', component: AcceptPhotoComponent },
  { path: 'select-print-photos', component: SelectPrintPhotosComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
