import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GhostRiderEvent, GhostRiderEventType, GhostRiderModule } from 'ng-ghost-rider';
import { SharedModule } from '../../../app/modules/shared.module';
import { Section, SECTIONS } from '../constants/docs.constant';

@Component({
	selector: 'app-docs',
	templateUrl: 'docs.component.html',
	styleUrls: ['docs.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		GhostRiderModule,
		RouterModule,
		SharedModule,
	],
})
export class DocsComponent {
	public sections: Section[] = SECTIONS;

	constructor(
		private readonly _router: Router,
	) { }

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Back) {
			this._router.navigate(['home']);
		}
	}
}