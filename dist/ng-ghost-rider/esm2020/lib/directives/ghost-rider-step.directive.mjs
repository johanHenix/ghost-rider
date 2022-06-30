import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../providers/ghost-rider.service";
export class GhostRiderStepDirective {
    constructor(element, vcr, _ghostRiderService) {
        this.element = element;
        this.vcr = vcr;
        this._ghostRiderService = _ghostRiderService;
        this.ghostRiderStepEvent = new EventEmitter();
        this.active$ = new BehaviorSubject(false);
        this._subs = [];
    }
    set ghostRiderStep(config) {
        this.config = {
            ...new GhostRiderStepConfig(),
            ...config,
        };
    }
    get ghostRiderStep() {
        return this.config;
    }
    ngOnInit() {
        if (this.config.name && this.config.shouldRegister) {
            this._ghostRiderService.registerStep(this);
        }
    }
    ngOnDestroy() {
        if (this.config && this.config.name) {
            this._ghostRiderService.unregisterStep(this);
        }
        this._subs.forEach((sub) => sub.unsubscribe());
    }
}
GhostRiderStepDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepDirective, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepDirective, selector: "[ghostRiderStep]", inputs: { ghostRiderStep: "ghostRiderStep" }, outputs: { ghostRiderStepEvent: "ghostRiderStepEvent" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStep]' }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1.GhostRiderService }]; }, propDecorators: { ghostRiderStep: [{
                type: Input
            }], ghostRiderStepEvent: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItc3RlcC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZy1naG9zdC1yaWRlci9zcmMvbGliL2RpcmVjdGl2ZXMvZ2hvc3QtcmlkZXItc3RlcC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBYyxZQUFZLEVBQUUsS0FBSyxFQUFxQixNQUFNLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBRXhILE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBRy9FLE9BQU8sRUFBRSxlQUFlLEVBQWdCLE1BQU0sTUFBTSxDQUFDOzs7QUFHckQsTUFBTSxPQUFPLHVCQUF1QjtJQXFCbkMsWUFDbUIsT0FBZ0MsRUFDaEMsR0FBcUIsRUFDdEIsa0JBQXFDO1FBRnBDLFlBQU8sR0FBUCxPQUFPLENBQXlCO1FBQ2hDLFFBQUcsR0FBSCxHQUFHLENBQWtCO1FBQ3RCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFWL0Msd0JBQW1CLEdBQWtDLElBQUksWUFBWSxFQUFFLENBQUM7UUFHeEUsWUFBTyxHQUE2QixJQUFJLGVBQWUsQ0FBQyxLQUFnQixDQUFDLENBQUM7UUFFaEUsVUFBSyxHQUFtQixFQUFFLENBQUM7SUFNekMsQ0FBQztJQXhCSixJQUNXLGNBQWMsQ0FBQyxNQUF3QztRQUNoRSxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osR0FBRyxJQUFJLG9CQUFvQixFQUFFO1lBQzdCLEdBQUcsTUFBTTtTQUNWLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBZ0JELFFBQVE7UUFDTixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQ2xELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtZQUNuQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7O29IQXZDVSx1QkFBdUI7d0dBQXZCLHVCQUF1QjsyRkFBdkIsdUJBQXVCO2tCQURuQyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFO2dLQUc5QixjQUFjO3NCQUR4QixLQUFLO2dCQWFDLG1CQUFtQjtzQkFEekIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgR2hvc3RSaWRlclNlcnZpY2UgfSBmcm9tICcuLi9wcm92aWRlcnMvZ2hvc3QtcmlkZXIuc2VydmljZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU3RlcENvbmZpZyB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1zdGVwLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU3RlcERldGFpbHMgfSBmcm9tICcuLi9tb2RlbHMvZ2hvc3QtcmlkZXItc3RlcC1kZXRhaWxzLm1vZGVsJztcbmltcG9ydCB7IEdob3N0UmlkZXJFdmVudCB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1zdGVwLWV2ZW50Lm1vZGVsJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tnaG9zdFJpZGVyU3RlcF0nIH0pXG5leHBvcnQgY2xhc3MgR2hvc3RSaWRlclN0ZXBEaXJlY3RpdmU8VCA9IGFueT4gaW1wbGVtZW50cyBHaG9zdFJpZGVyU3RlcERldGFpbHMsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgLy8gTWlnaHQgd2FudCB0byByZW1vdmUgdGhlICdQYXJ0aWFsJ1xuICBwdWJsaWMgc2V0IGdob3N0UmlkZXJTdGVwKGNvbmZpZzogUGFydGlhbDxHaG9zdFJpZGVyU3RlcENvbmZpZzxUPj4pIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIC4uLm5ldyBHaG9zdFJpZGVyU3RlcENvbmZpZygpLFxuICAgICAgLi4uY29uZmlnLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGdob3N0UmlkZXJTdGVwKCk6IEdob3N0UmlkZXJTdGVwQ29uZmlnPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cblxuICBAT3V0cHV0KClcbiAgcHVibGljIGdob3N0UmlkZXJTdGVwRXZlbnQ6IEV2ZW50RW1pdHRlcjxHaG9zdFJpZGVyRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIHB1YmxpYyBjb25maWchOiBHaG9zdFJpZGVyU3RlcENvbmZpZzxUPjtcbiAgcHVibGljIGFjdGl2ZSQ6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoZmFsc2UgYXMgYm9vbGVhbik7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfc3ViczogU3Vic2NyaXB0aW9uW10gPSBbXTtcblxuXHRjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHVibGljIHJlYWRvbmx5IHZjcjogVmlld0NvbnRhaW5lclJlZixcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9naG9zdFJpZGVyU2VydmljZTogR2hvc3RSaWRlclNlcnZpY2UsXG5cdCkgeyB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY29uZmlnLm5hbWUgJiYgdGhpcy5jb25maWcuc2hvdWxkUmVnaXN0ZXIpIHtcbiAgICAgIHRoaXMuX2dob3N0UmlkZXJTZXJ2aWNlLnJlZ2lzdGVyU3RlcCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jb25maWcgJiYgdGhpcy5jb25maWcubmFtZSkge1xuICAgICAgdGhpcy5fZ2hvc3RSaWRlclNlcnZpY2UudW5yZWdpc3RlclN0ZXAodGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3Vicy5mb3JFYWNoKChzdWIpID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcbiAgfVxufSJdfQ==