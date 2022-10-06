import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { GhostRiderModule } from 'ng-ghost-rider';

// COMPONENTS
import { AppComponent } from '../app/components/app/app.component';
import { GithubCorner } from './components/github-corner/github-corner.component';

// MODULES
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './modules/shared.module';

const COMPONENTS = [
  AppComponent,
  GithubCorner,
];

@NgModule({
  declarations: [
    COMPONENTS
  ],
  imports: [
    PortalModule,
    BrowserModule,
    AppRoutingModule,
    GhostRiderModule,
    SharedModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
