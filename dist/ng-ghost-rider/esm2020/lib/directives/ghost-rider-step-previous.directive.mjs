import { Directive, HostListener } from '@angular/core';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import * as i0 from "@angular/core";
import * as i1 from "../providers/ghost-rider.service";
export class GhostRiderStepPreviousDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
    }
    previous() {
        this._ghostRiderService.back(GhostRiderEventSource.Directive);
    }
}
GhostRiderStepPreviousDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepPreviousDirective, deps: [{ token: i1.GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepPreviousDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepPreviousDirective, selector: "[ghostRiderStepPrevious]", host: { listeners: { "click": "previous()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepPreviousDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepPrevious]' }]
        }], ctorParameters: function () { return [{ type: i1.GhostRiderService }]; }, propDecorators: { previous: [{
                type: HostListener,
                args: ['click']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItc3RlcC1wcmV2aW91cy5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZy1naG9zdC1yaWRlci9zcmMvbGliL2RpcmVjdGl2ZXMvZ2hvc3QtcmlkZXItc3RlcC1wcmV2aW91cy5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7OztBQUcvRSxNQUFNLE9BQU8sK0JBQStCO0lBRTFDLFlBQ21CLGtCQUFxQztRQUFyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO0lBQ3BELENBQUM7SUFHRSxRQUFRO1FBQ2IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDOzs0SEFUVSwrQkFBK0I7Z0hBQS9CLCtCQUErQjsyRkFBL0IsK0JBQStCO2tCQUQzQyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFFO3dHQVExQyxRQUFRO3NCQURkLFlBQVk7dUJBQUMsT0FBTyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSG9zdExpc3RlbmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU2VydmljZSB9IGZyb20gJy4uL3Byb3ZpZGVycy9naG9zdC1yaWRlci5zZXJ2aWNlJztcbmltcG9ydCB7IEdob3N0UmlkZXJFdmVudFNvdXJjZSB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1zdGVwLWV2ZW50Lm1vZGVsJztcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW2dob3N0UmlkZXJTdGVwUHJldmlvdXNdJyB9KVxuZXhwb3J0IGNsYXNzIEdob3N0UmlkZXJTdGVwUHJldmlvdXNEaXJlY3RpdmUge1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2dob3N0UmlkZXJTZXJ2aWNlOiBHaG9zdFJpZGVyU2VydmljZSxcbiAgKSB7IH1cblxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXG4gIHB1YmxpYyBwcmV2aW91cygpOiB2b2lkIHtcbiAgICB0aGlzLl9naG9zdFJpZGVyU2VydmljZS5iYWNrKEdob3N0UmlkZXJFdmVudFNvdXJjZS5EaXJlY3RpdmUpO1xuICB9XG59XG4iXX0=