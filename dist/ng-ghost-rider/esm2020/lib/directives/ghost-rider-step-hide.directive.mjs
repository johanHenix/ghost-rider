import { Directive, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../providers/ghost-rider.service";
export class GhostRiderStepHideDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
    }
    hide() {
        if (this._ghostRiderService.activeTour) {
            this._ghostRiderService.hideStep();
        }
    }
}
GhostRiderStepHideDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepHideDirective, deps: [{ token: i1.GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepHideDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepHideDirective, selector: "[ghostRiderStepHide]", host: { listeners: { "click": "hide()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepHideDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepHide]' }]
        }], ctorParameters: function () { return [{ type: i1.GhostRiderService }]; }, propDecorators: { hide: [{
                type: HostListener,
                args: ['click']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItc3RlcC1oaWRlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWdob3N0LXJpZGVyL3NyYy9saWIvZGlyZWN0aXZlcy9naG9zdC1yaWRlci1zdGVwLWhpZGUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJeEQsTUFBTSxPQUFPLDJCQUEyQjtJQUN0QyxZQUNtQixrQkFBcUM7UUFBckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtJQUNwRCxDQUFDO0lBR0UsSUFBSTtRQUNULElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRTtZQUN0QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDcEM7SUFDSCxDQUFDOzt3SEFWVSwyQkFBMkI7NEdBQTNCLDJCQUEyQjsyRkFBM0IsMkJBQTJCO2tCQUR2QyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixFQUFFO3dHQU90QyxJQUFJO3NCQURWLFlBQVk7dUJBQUMsT0FBTyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSG9zdExpc3RlbmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU2VydmljZSB9IGZyb20gJy4uL3Byb3ZpZGVycy9naG9zdC1yaWRlci5zZXJ2aWNlJztcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW2dob3N0UmlkZXJTdGVwSGlkZV0nIH0pXG5leHBvcnQgY2xhc3MgR2hvc3RSaWRlclN0ZXBIaWRlRGlyZWN0aXZlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZ2hvc3RSaWRlclNlcnZpY2U6IEdob3N0UmlkZXJTZXJ2aWNlLFxuICApIHsgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJylcbiAgcHVibGljIGhpZGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2dob3N0UmlkZXJTZXJ2aWNlLmFjdGl2ZVRvdXIpIHtcbiAgICAgIHRoaXMuX2dob3N0UmlkZXJTZXJ2aWNlLmhpZGVTdGVwKCk7XG4gICAgfVxuICB9XG59XG4iXX0=