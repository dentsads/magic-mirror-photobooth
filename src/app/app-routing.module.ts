import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Anim1Component } from './anim1/anim1.component';
import { IntroComponent } from './intro/intro.component';


const routes: Routes = [
  { path: '', redirectTo: '/intro', pathMatch: 'full' },
  { path: 'intro', component: IntroComponent },
  { path: 'anim1/:id', component: Anim1Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
