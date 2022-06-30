import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import * as i0 from "@angular/core";
import * as i1 from "../providers/ghost-rider.service";
export class GhostRiderStepAdvanceDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
        this.ghostRiderStepAdvance = new EventEmitter();
    }
    advance(event) {
        this.ghostRiderStepAdvance.emit(event);
        this._ghostRiderService.next(GhostRiderEventSource.Directive);
    }
}
GhostRiderStepAdvanceDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepAdvanceDirective, deps: [{ token: i1.GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepAdvanceDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepAdvanceDirective, selector: "[ghostRiderStepAdvance]", outputs: { ghostRiderStepAdvance: "ghostRiderStepAdvance" }, host: { listeners: { "click": "advance($event)" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepAdvanceDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepAdvance]' }]
        }], ctorParameters: function () { return [{ type: i1.GhostRiderService }]; }, propDecorators: { ghostRiderStepAdvance: [{
                type: Output
            }], advance: [{
                type: HostListener,
                args: ['click', ['$event']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItc3RlcC1hZHZhbmNlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWdob3N0LXJpZGVyL3NyYy9saWIvZGlyZWN0aXZlcy9naG9zdC1yaWRlci1zdGVwLWFkdmFuY2UuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFOUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7OztBQUcvRSxNQUFNLE9BQU8sOEJBQThCO0lBSXpDLFlBQ21CLGtCQUFxQztRQUFyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBSGpELDBCQUFxQixHQUE2QixJQUFJLFlBQVksRUFBRSxDQUFDO0lBSXhFLENBQUM7SUFHRSxPQUFPLENBQUMsS0FBaUI7UUFDOUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7OzJIQVpVLDhCQUE4QjsrR0FBOUIsOEJBQThCOzJGQUE5Qiw4QkFBOEI7a0JBRDFDLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUseUJBQXlCLEVBQUU7d0dBR3pDLHFCQUFxQjtzQkFEM0IsTUFBTTtnQkFRQSxPQUFPO3NCQURiLFlBQVk7dUJBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIEhvc3RMaXN0ZW5lciwgT3V0cHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU2VydmljZSB9IGZyb20gJy4uL3Byb3ZpZGVycy9naG9zdC1yaWRlci5zZXJ2aWNlJztcbmltcG9ydCB7IEdob3N0UmlkZXJFdmVudFNvdXJjZSB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1zdGVwLWV2ZW50Lm1vZGVsJztcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW2dob3N0UmlkZXJTdGVwQWR2YW5jZV0nIH0pXG5leHBvcnQgY2xhc3MgR2hvc3RSaWRlclN0ZXBBZHZhbmNlRGlyZWN0aXZlIHtcbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBnaG9zdFJpZGVyU3RlcEFkdmFuY2U6IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9naG9zdFJpZGVyU2VydmljZTogR2hvc3RSaWRlclNlcnZpY2UsXG4gICkgeyB9XG5cbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudCddKVxuICBwdWJsaWMgYWR2YW5jZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuZ2hvc3RSaWRlclN0ZXBBZHZhbmNlLmVtaXQoZXZlbnQpO1xuICAgIHRoaXMuX2dob3N0UmlkZXJTZXJ2aWNlLm5leHQoR2hvc3RSaWRlckV2ZW50U291cmNlLkRpcmVjdGl2ZSk7XG4gIH1cbn1cbiJdfQ==