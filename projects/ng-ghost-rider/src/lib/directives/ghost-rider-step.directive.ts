import { Directive, Input, OnInit } from '@angular/core';
import { GhostRiderService } from '../ng-ghost-rider.service';

@Directive({ selector: '[ghostRiderStep]' })
export class GhostRiderStepDirective implements OnInit {
	@Input()
	public ghostRiderStep: any;

	constructor(
		private readonly _ghostRiderService: GhostRiderService,
	) { }

	ngOnInit(): void {
		console.log('directive', this);
	}
}