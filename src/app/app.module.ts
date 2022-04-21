import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GhostRiderModule } from 'ng-ghost-rider';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GhostRiderModule
  ],
  // providers: [
  //   GhostRiderBackdropService,
  // ],
  bootstrap: [AppComponent]
})
export class AppModule { }
