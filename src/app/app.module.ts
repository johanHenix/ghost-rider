import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgGhostRiderModule } from 'ng-ghost-rider';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgGhostRiderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
