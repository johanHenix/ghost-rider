import { Component, Inject } from '@angular/core';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import { GHOST_RIDER_NAVIGATION } from '../tokens/ghost-rider-navigation.token';
import { PopoverComponent } from './popover.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/portal";
export class GhostRiderStepComponent extends PopoverComponent {
    constructor(_navigation, cdr) {
        super(cdr);
        this._navigation = _navigation;
        this.isSubStep = !!this._navigation.tourGuide.activeStep.parent;
        this.stepName = this._navigation.tourGuide.activeStep.name;
        this.hasSubSteps = this._navigation.tourGuide.activeStep.hasSubSteps;
        if (this.isSubStep) {
            const siblings = this._navigation.tourGuide.activeStep.parent?.subSteps;
            if (siblings) {
                this.stepIndex = siblings.indexOf(this._navigation.tourGuide.activeStep);
                this.stepCount = siblings.length;
            }
        }
        else {
            this.stepIndex = this._navigation.tourGuide.currentStep;
            this.stepCount = this._navigation.tourGuide.steps.length;
        }
        this.isLastStep = this.stepIndex === this.stepCount - 1;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    next() {
        if (this.details.nextIsHide) {
            this._navigation.hideStep();
        }
        else {
            this._navigation.next(GhostRiderEventSource.Popover);
        }
    }
    nextSubStep() {
        this._navigation.nextSubStep(GhostRiderEventSource.Popover);
    }
    previousSubStep() {
        this._navigation.previousSubStep(GhostRiderEventSource.Popover);
    }
    goToParent() {
        this._navigation.goToParent(GhostRiderEventSource.Popover);
    }
    back() {
        this._navigation.back(GhostRiderEventSource.Popover);
    }
    close() {
        this._navigation.close(GhostRiderEventSource.Popover);
    }
    complete() {
        this._navigation.complete(GhostRiderEventSource.Popover);
    }
}
GhostRiderStepComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepComponent, deps: [{ token: GHOST_RIDER_NAVIGATION }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
GhostRiderStepComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepComponent, selector: "ghost-rider-step", usesInheritance: true, ngImport: i0, template: `
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
	`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.CdkPortal, selector: "[cdkPortal]", exportAs: ["cdkPortal"] }, { kind: "directive", type: i2.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ghost-rider-step', template: `
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
	` }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [GHOST_RIDER_NAVIGATION]
                }] }, { type: i0.ChangeDetectorRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItc3RlcC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZy1naG9zdC1yaWRlci9zcmMvbGliL2NvbXBvbmVudHMvZ2hvc3QtcmlkZXItc3RlcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFxQixTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3JFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7O0FBNEV2RCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsZ0JBQWdCO0lBVTVELFlBQ2tELFdBQWlDLEVBQ2xGLEdBQXNCO1FBRXRCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUhzQyxnQkFBVyxHQUFYLFdBQVcsQ0FBc0I7UUFLbEYsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNoRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDM0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBRXJFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztZQUN4RSxJQUFJLFFBQVEsRUFBRTtnQkFDYixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNqQztTQUNEO2FBQU07WUFDTixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUN4RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDekQ7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFdBQVc7UUFDVixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVNLElBQUk7UUFDVixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDNUI7YUFBTTtZQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3JEO0lBQ0YsQ0FBQztJQUVNLFdBQVc7UUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVNLGVBQWU7UUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVNLFVBQVU7UUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVNLElBQUk7UUFDVixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sS0FBSztRQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFTSxRQUFRO1FBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQzs7b0hBcEVXLHVCQUF1QixrQkFXMUIsc0JBQXNCO3dHQVhuQix1QkFBdUIsK0VBeEV6Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBcUVUOzJGQUdXLHVCQUF1QjtrQkExRW5DLFNBQVM7K0JBQ0Msa0JBQWtCLFlBQ2xCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFxRVQ7OzBCQWNDLE1BQU07MkJBQUMsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyTmF2aWdhdGlvbiB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1uYXZpZ2F0aW9uLm1vZGVsJztcbmltcG9ydCB7IEdob3N0UmlkZXJTdGVwQ29uZmlnIH0gZnJvbSAnLi4vbW9kZWxzL2dob3N0LXJpZGVyLXN0ZXAtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IEdob3N0UmlkZXJFdmVudFNvdXJjZSB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1zdGVwLWV2ZW50Lm1vZGVsJztcbmltcG9ydCB7IEdIT1NUX1JJREVSX05BVklHQVRJT04gfSBmcm9tICcuLi90b2tlbnMvZ2hvc3QtcmlkZXItbmF2aWdhdGlvbi50b2tlbic7XG5pbXBvcnQgeyBQb3BvdmVyQ29tcG9uZW50IH0gZnJvbSAnLi9wb3BvdmVyLmNvbXBvbmVudCc7XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogJ2dob3N0LXJpZGVyLXN0ZXAnLFxuXHR0ZW1wbGF0ZTogYFxuXHRcdDxkaXZcblx0XHRcdGNsYXNzPVwiZ2hvc3QtcmlkZXItcG9wb3ZlclwiXG5cdFx0XHRbbmdDbGFzc109XCJudWJiaW5DbHNcIlxuXHRcdFx0cm9sZT1cImRpYWxvZ1wiXG5cdFx0PlxuXHRcdFx0PGRpdiBjbGFzcz1cImdob3N0LXJpZGVyLXBvcG92ZXJfX2hlYWRlclwiPlxuXHRcdFx0XHQ8aDIgY2xhc3M9XCJnaG9zdC1yaWRlcl90aXRsZVwiPnt7IGRldGFpbHMudGl0bGUgfHwgJyZuYnNwOycgfX08L2gyPlxuXHRcdFx0XHQ8ZGl2XG5cdFx0XHRcdFx0KGNsaWNrKT1cImNsb3NlKClcIlxuXHRcdFx0XHRcdGNsYXNzPVwiZ2hvc3QtcmlkZXJfY2xvc2UtYnV0dG9uXCJcblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzdmdcblx0XHRcdFx0XHRcdHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXHRcdFx0XHRcdFx0YXJpYS1oaWRkZW49XCJ0cnVlXCJcblx0XHRcdFx0XHRcdHJvbGU9XCJpbWdcIlxuXHRcdFx0XHRcdFx0d2lkdGg9XCIxLjNlbVwiXG5cdFx0XHRcdFx0XHRoZWlnaHQ9XCIxLjNlbVwiXG5cdFx0XHRcdFx0XHRwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWQgbWVldFwiXG5cdFx0XHRcdFx0XHR2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiXG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PHBhdGhcblx0XHRcdFx0XHRcdFx0ZmlsbD1cImN1cnJlbnRDb2xvclwiXG5cdFx0XHRcdFx0XHRcdGQ9XCJNMTk1LjIgMTk1LjJhNjQgNjQgMCAwIDEgOTAuNDk2IDBMNTEyIDQyMS41MDRMNzM4LjMwNCAxOTUuMmE2NCA2NCAwIDAgMSA5MC40OTYgOTAuNDk2TDYwMi40OTYgNTEyTDgyOC44IDczOC4zMDRhNjQgNjQgMCAwIDEtOTAuNDk2IDkwLjQ5Nkw1MTIgNjAyLjQ5NkwyODUuNjk2IDgyOC44YTY0IDY0IDAgMCAxLTkwLjQ5Ni05MC40OTZMNDIxLjUwNCA1MTJMMTk1LjIgMjg1LjY5NmE2NCA2NCAwIDAgMSAwLTkwLjQ5NnpcIlxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblxuXHRcdFx0PGRpdiBjbGFzcz1cImdob3N0LXJpZGVyLXBvcG92ZXJfX2JvZHlcIj5cblx0XHRcdFx0PG5nLWNvbnRhaW5lciBbY2RrUG9ydGFsT3V0bGV0XT1cImNvbnRlbnRDbXAgfHwgY29udGVudFRwbCB8fCBjb250ZW50VGV4dFRwbFwiPjwvbmctY29udGFpbmVyPlxuXHRcdFx0PC9kaXY+XG5cblx0XHRcdDxkaXYgY2xhc3M9XCJnaG9zdC1yaWRlci1wb3BvdmVyX19mb290ZXJcIj5cblx0XHRcdFx0PHNwYW4+XG5cdFx0XHRcdFx0U3RlcCB7eyBzdGVwSW5kZXggKyAxIH19IG9mIHt7IHN0ZXBDb3VudCB9fVxuXHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdDxkaXY+XG5cdFx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdFx0KGNsaWNrKT1cImJhY2soKVwiXG5cdFx0XHRcdFx0XHQqbmdJZj1cInN0ZXBJbmRleCA+IDBcIlxuXHRcdFx0XHRcdFx0Y2xhc3M9XCJnaG9zdC1yaWRlcl9iYWNrLWJ1dHRvblwiXG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0QmFja1xuXHRcdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRcdChjbGljayk9XCJuZXh0KClcIlxuXHRcdFx0XHRcdFx0Km5nSWY9XCIhaXNMYXN0U3RlcFwiXG5cdFx0XHRcdFx0XHRjbGFzcz1cImdob3N0LXJpZGVyX25leHQtYnV0dG9uXCJcblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHROZXh0XG5cdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdFx0KGNsaWNrKT1cImNvbXBsZXRlKClcIlxuXHRcdFx0XHRcdFx0Km5nSWY9XCJpc0xhc3RTdGVwXCJcblx0XHRcdFx0XHRcdGNsYXNzPVwiZ2hvc3QtcmlkZXJfY29tcGxldGUtYnV0dG9uXCJcblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRDb21wbGV0ZVxuXHRcdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXG5cdFx0PG5nLXRlbXBsYXRlXG5cdFx0XHRjZGtQb3J0YWxcblx0XHRcdCNjb250ZW50VGV4dFRwbD1cImNka1BvcnRhbFwiXG5cdFx0PlxuXHRcdFx0e3sgY29udGVudFRleHQgfX1cblx0XHQ8L25nLXRlbXBsYXRlPlxuXHRgLFxuXHRzdHlsZXM6IFtdLFxufSlcbmV4cG9ydCBjbGFzcyBHaG9zdFJpZGVyU3RlcENvbXBvbmVudCBleHRlbmRzIFBvcG92ZXJDb21wb25lbnQge1xuXHRwdWJsaWMgc3RlcEluZGV4OiBudW1iZXI7XG5cdHB1YmxpYyBzdGVwQ291bnQ6IG51bWJlcjtcblx0cHVibGljIHN0ZXBOYW1lOiBzdHJpbmc7XG5cdHB1YmxpYyBpc0xhc3RTdGVwOiBib29sZWFuO1xuXHRwdWJsaWMgaGFzU3ViU3RlcHM6IGJvb2xlYW47XG5cdHB1YmxpYyBkZXRhaWxzOiBHaG9zdFJpZGVyU3RlcENvbmZpZztcblxuXHRwdWJsaWMgcmVhZG9ubHkgaXNTdWJTdGVwOiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdEBJbmplY3QoR0hPU1RfUklERVJfTkFWSUdBVElPTikgcHJpdmF0ZSByZWFkb25seSBfbmF2aWdhdGlvbjogR2hvc3RSaWRlck5hdmlnYXRpb24sXG5cdFx0Y2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcblx0KSB7XG5cdFx0c3VwZXIoY2RyKTtcblxuXHRcdHRoaXMuaXNTdWJTdGVwID0gISF0aGlzLl9uYXZpZ2F0aW9uLnRvdXJHdWlkZS5hY3RpdmVTdGVwLnBhcmVudDtcblx0XHR0aGlzLnN0ZXBOYW1lID0gdGhpcy5fbmF2aWdhdGlvbi50b3VyR3VpZGUuYWN0aXZlU3RlcC5uYW1lO1xuXHRcdHRoaXMuaGFzU3ViU3RlcHMgPSB0aGlzLl9uYXZpZ2F0aW9uLnRvdXJHdWlkZS5hY3RpdmVTdGVwLmhhc1N1YlN0ZXBzO1xuXG5cdFx0aWYgKHRoaXMuaXNTdWJTdGVwKSB7XG5cdFx0XHRjb25zdCBzaWJsaW5ncyA9IHRoaXMuX25hdmlnYXRpb24udG91ckd1aWRlLmFjdGl2ZVN0ZXAucGFyZW50Py5zdWJTdGVwcztcblx0XHRcdGlmIChzaWJsaW5ncykge1xuXHRcdFx0XHR0aGlzLnN0ZXBJbmRleCA9IHNpYmxpbmdzLmluZGV4T2YodGhpcy5fbmF2aWdhdGlvbi50b3VyR3VpZGUuYWN0aXZlU3RlcCk7XG5cdFx0XHRcdHRoaXMuc3RlcENvdW50ID0gc2libGluZ3MubGVuZ3RoO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnN0ZXBJbmRleCA9IHRoaXMuX25hdmlnYXRpb24udG91ckd1aWRlLmN1cnJlbnRTdGVwO1xuXHRcdFx0dGhpcy5zdGVwQ291bnQgPSB0aGlzLl9uYXZpZ2F0aW9uLnRvdXJHdWlkZS5zdGVwcy5sZW5ndGg7XG5cdFx0fVxuXG5cdFx0dGhpcy5pc0xhc3RTdGVwID0gdGhpcy5zdGVwSW5kZXggPT09IHRoaXMuc3RlcENvdW50IC0gMTtcblx0fVxuXG5cdG5nT25EZXN0cm95KCk6IHZvaWQge1xuXHRcdHN1cGVyLm5nT25EZXN0cm95KCk7XG5cdH1cblxuXHRwdWJsaWMgbmV4dCgpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5kZXRhaWxzLm5leHRJc0hpZGUpIHtcblx0XHRcdHRoaXMuX25hdmlnYXRpb24uaGlkZVN0ZXAoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fbmF2aWdhdGlvbi5uZXh0KEdob3N0UmlkZXJFdmVudFNvdXJjZS5Qb3BvdmVyKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgbmV4dFN1YlN0ZXAoKTogdm9pZCB7XG5cdFx0dGhpcy5fbmF2aWdhdGlvbi5uZXh0U3ViU3RlcChHaG9zdFJpZGVyRXZlbnRTb3VyY2UuUG9wb3Zlcik7XG5cdH1cblxuXHRwdWJsaWMgcHJldmlvdXNTdWJTdGVwKCk6IHZvaWQge1xuXHRcdHRoaXMuX25hdmlnYXRpb24ucHJldmlvdXNTdWJTdGVwKEdob3N0UmlkZXJFdmVudFNvdXJjZS5Qb3BvdmVyKTtcblx0fVxuXG5cdHB1YmxpYyBnb1RvUGFyZW50KCk6IHZvaWQge1xuXHRcdHRoaXMuX25hdmlnYXRpb24uZ29Ub1BhcmVudChHaG9zdFJpZGVyRXZlbnRTb3VyY2UuUG9wb3Zlcik7XG5cdH1cblxuXHRwdWJsaWMgYmFjaygpOiB2b2lkIHtcblx0XHR0aGlzLl9uYXZpZ2F0aW9uLmJhY2soR2hvc3RSaWRlckV2ZW50U291cmNlLlBvcG92ZXIpO1xuXHR9XG5cblx0cHVibGljIGNsb3NlKCk6IHZvaWQge1xuXHRcdHRoaXMuX25hdmlnYXRpb24uY2xvc2UoR2hvc3RSaWRlckV2ZW50U291cmNlLlBvcG92ZXIpO1xuXHR9XG5cblx0cHVibGljIGNvbXBsZXRlKCk6IHZvaWQge1xuXHRcdHRoaXMuX25hdmlnYXRpb24uY29tcGxldGUoR2hvc3RSaWRlckV2ZW50U291cmNlLlBvcG92ZXIpO1xuXHR9XG59Il19