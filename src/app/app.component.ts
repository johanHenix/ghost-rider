import { Component } from '@angular/core';
import { NgGhostRiderService } from 'ng-ghost-rider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ghost-rider';

  constructor(
    private readonly _ghostRiderService: NgGhostRiderService,
  ) { }
}
