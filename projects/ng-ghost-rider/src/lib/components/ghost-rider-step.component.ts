import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import { GhostRiderNavigation, GHOST_RIDER_NAVIGATION } from '../providers/ghost-rider-navigation.token';
import { PopoverComponent } from './popover.component';

@Component({
	selector: 'ghost-rider-step',
	template: `
		<div
			class="ghost-rider-popover"
			[ngClass]="nubbinCls"
			role="dialog"
		>
			<div class="ghost-rider-popover__header">
				<h2 class="ghost-rider_title">{{ details.title || '&nbsp;' }}</h2>
				<div
					(click)="close()"
					class="ghost-rider_close-button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						role="img"
						width="1.3em"
						height="1.3em"
						preserveAspectRatio="xMidYMid meet"
						viewBox="0 0 1024 1024"
					>
						<path
							fill="currentColor"
							d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504L738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512L828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496L285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512L195.2 285.696a64 64 0 0 1 0-90.496z"
						/>
					</svg>
				</div>
			</div>

			<div class="ghost-rider-popover__body">
				<ng-container [cdkPortalOutlet]="contentCmp || contentTpl || contentTextTpl"></ng-container>
			</div>

			<div class="ghost-rider-popover__footer">
				<span>
					Step {{ stepIndex + 1 }} of {{ stepCount }}
				</span>
				<div>
					<button
						(click)="back()"
						*ngIf="stepIndex > 0"
						class="ghost-rider_back-button"
					>
						Back
					</button>
					<button
						(click)="next()"
						*ngIf="!isLastStep"
						class="ghost-rider_next-button"
					>
						Next
					</button>
					<button
						(click)="complete()"
						*ngIf="isLastStep"
						class="ghost-rider_complete-button"
					>
						Complete
					</button>
				</div>
			</div>
		</div>

		<ng-template
			cdkPortal
			#contentTextTpl="cdkPortal"
		>
			{{ contentText }}
		</ng-template>
	`,
	styles: [],
})
export class GhostRiderStepComponent extends PopoverComponent {
	public stepIndex: number;
	public stepCount: number;
	public stepName: string;
	public isLastStep: boolean;
	public hasSubSteps: boolean;
	public details: GhostRiderStepConfig;

	public readonly isSubStep: boolean;

	constructor(
		@Inject(GHOST_RIDER_NAVIGATION) private readonly _navigation: GhostRiderNavigation,
		cdr: ChangeDetectorRef,
	) {
		super(cdr);

		this.isSubStep = !!this._navigation.tourGuide.activeStep.parent;
		this.stepName = this._navigation.tourGuide.activeStep.name;
		this.hasSubSteps = this._navigation.tourGuide.activeStep.hasSubSteps;

		if (this.isSubStep) {
			const siblings = this._navigation.tourGuide.activeStep.parent?.subSteps;
			if (siblings) {
				this.stepIndex = siblings.indexOf(this._navigation.tourGuide.activeStep);
				this.stepCount = siblings.length;
			}
		} else {
			this.stepIndex = this._navigation.tourGuide.currentStep;
			this.stepCount = this._navigation.tourGuide.steps.length;
		}

		this.isLastStep = this.stepIndex === this.stepCount - 1;
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public next(): void {
		if (this.details.nextIsHide) {
			this._navigation.hideStep();
		} else {
			this._navigation.next(GhostRiderEventSource.Popover);
		}
	}

	public nextSubStep(): void {
		this._navigation.nextSubStep(GhostRiderEventSource.Popover);
	}

	public previousSubStep(): void {
		this._navigation.previousSubStep(GhostRiderEventSource.Popover);
	}

	public goToParent(): void {
		this._navigation.goToParent(GhostRiderEventSource.Popover);
	}

	public back(): void {
		this._navigation.back(GhostRiderEventSource.Popover);
	}

	public close(): void {
		this._navigation.close(GhostRiderEventSource.Popover);
	}

	public complete(): void {
		this._navigation.complete(GhostRiderEventSource.Popover);
	}
}