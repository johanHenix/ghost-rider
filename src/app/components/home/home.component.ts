import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GhostRiderEvent, GhostRiderEventType } from 'ng-ghost-rider';

@Component({
	selector: 'app-home',
	templateUrl: 'home.component.html',
})
export class HomeComponent {

	constructor(
		private readonly _router: Router,
	) { }

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Next) {
			this._router.navigate(['movies']);
		}
	}
}
