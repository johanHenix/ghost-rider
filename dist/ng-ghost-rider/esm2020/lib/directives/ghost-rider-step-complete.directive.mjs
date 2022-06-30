import { Directive, HostListener } from '@angular/core';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import * as i0 from "@angular/core";
import * as i1 from "../providers/ghost-rider.service";
export class GhostRiderStepCompleteDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
    }
    complete() {
        this._ghostRiderService.complete(GhostRiderEventSource.Directive);
    }
}
GhostRiderStepCompleteDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepCompleteDirective, deps: [{ token: i1.GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepCompleteDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepCompleteDirective, selector: "[ghostRiderStepComplete]", host: { listeners: { "click": "complete()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepCompleteDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepComplete]' }]
        }], ctorParameters: function () { return [{ type: i1.GhostRiderService }]; }, propDecorators: { complete: [{
                type: HostListener,
                args: ['click']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItc3RlcC1jb21wbGV0ZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZy1naG9zdC1yaWRlci9zcmMvbGliL2RpcmVjdGl2ZXMvZ2hvc3QtcmlkZXItc3RlcC1jb21wbGV0ZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7OztBQUkvRSxNQUFNLE9BQU8sK0JBQStCO0lBRTFDLFlBQ21CLGtCQUFxQztRQUFyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO0lBQ3BELENBQUM7SUFHRSxRQUFRO1FBQ2IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwRSxDQUFDOzs0SEFUVSwrQkFBK0I7Z0hBQS9CLCtCQUErQjsyRkFBL0IsK0JBQStCO2tCQUQzQyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFFO3dHQVExQyxRQUFRO3NCQURkLFlBQVk7dUJBQUMsT0FBTyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSG9zdExpc3RlbmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyRXZlbnRTb3VyY2UgfSBmcm9tICcuLi9tb2RlbHMvZ2hvc3QtcmlkZXItc3RlcC1ldmVudC5tb2RlbCc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU2VydmljZSB9IGZyb20gJy4uL3Byb3ZpZGVycy9naG9zdC1yaWRlci5zZXJ2aWNlJztcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW2dob3N0UmlkZXJTdGVwQ29tcGxldGVdJyB9KVxuZXhwb3J0IGNsYXNzIEdob3N0UmlkZXJTdGVwQ29tcGxldGVEaXJlY3RpdmUge1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2dob3N0UmlkZXJTZXJ2aWNlOiBHaG9zdFJpZGVyU2VydmljZSxcbiAgKSB7IH1cblxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXG4gIHB1YmxpYyBjb21wbGV0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9naG9zdFJpZGVyU2VydmljZS5jb21wbGV0ZShHaG9zdFJpZGVyRXZlbnRTb3VyY2UuRGlyZWN0aXZlKTtcbiAgfVxufVxuIl19