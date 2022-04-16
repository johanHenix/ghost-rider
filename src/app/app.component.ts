import { AfterViewInit, Component } from '@angular/core';
import { GhostRiderService, GhostRiderStep } from 'ng-ghost-rider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'ghost-rider';

  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  ngAfterViewInit(): void {
    this._ghostRiderService.start(
      'tour',
      [
        new GhostRiderStep('firstStep'),
        new GhostRiderStep('secondStep'),
      ]
    );
  }
}
