import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GhostRiderModule } from 'ng-ghost-rider';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { MoviesComponent } from './components/movies/movies.component';

const COMPONENTS = [
  AppComponent,
  HomeComponent,
  MoviesComponent,
];

@NgModule({
  declarations: [
    COMPONENTS
  ],
  imports: [
    PortalModule,
    BrowserModule,
    AppRoutingModule,
    GhostRiderModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
