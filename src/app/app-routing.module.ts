import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Anim1Component } from './anim1/anim1.component';
import { IntroComponent } from './intro/intro.component';
import { DrawingToolComponent } from './drawing-tool/drawing-tool.component';
import { AcceptPhotoComponent } from './accept-photo/accept-photo.component';


const routes: Routes = [
  { path: '', redirectTo: '/intro', pathMatch: 'full' },
  { path: 'intro', component: IntroComponent },
  { path: 'anim1/:id', component: Anim1Component },
  { path: 'drawing', component: DrawingToolComponent },
  { path: 'accept-photo', component: AcceptPhotoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
