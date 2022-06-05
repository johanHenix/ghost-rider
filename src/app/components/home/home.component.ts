import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GhostRiderEvent, GhostRiderEventType, GhostRiderService } from 'ng-ghost-rider';
import { GhostRiderStep } from 'projects/ng-ghost-rider/src/lib/models/ghost-rider-step.model';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
	selector: 'app-home',
	templateUrl: 'home.component.html',
	styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnDestroy {
	private _subs: Map<string, Subscription> = new Map();

	constructor(
		private readonly _router: Router,
		private readonly _ghostRiderService: GhostRiderService,
	) {
		/**
		 * We can kick off here... or do it on an 'action'
		 */
		// this.startTour();;
	}

	ngOnDestroy(): void {
		this._subs.forEach((sub) => sub.unsubscribe());
	}

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Next) {
			this._router.navigate(['movies']);
		}
	}

	public startTour(): void {
		this._ghostRiderService.start(
			'tour',
			[
				new GhostRiderStep('firstStep'),
				new GhostRiderStep('secondStep'),
				new GhostRiderStep('thirdStep'),
				new GhostRiderStep('fourthStep'),
			]
		);
	}
}
