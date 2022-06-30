import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
export class GhostRiderOverlayContainer extends OverlayContainer {
    constructor(document, platform) {
        super(document, platform);
    }
    _createContainer() {
        super._createContainer();
        this._containerElement.classList.add('ghost-rider'); // TODO: Make configurable
    }
}
GhostRiderOverlayContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderOverlayContainer, deps: [{ token: DOCUMENT }, { token: i1.Platform }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderOverlayContainer.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderOverlayContainer, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderOverlayContainer, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.Platform }]; } });
export const GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER = {
    provide: OverlayContainer,
    useExisting: GhostRiderOverlayContainer,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1jb250YWluZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWdob3N0LXJpZGVyL3NyYy9saWIvcHJvdmlkZXJzL292ZXJsYXktY29udGFpbmVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7O0FBSXhELE1BQU0sT0FBTywwQkFBMkIsU0FBUSxnQkFBZ0I7SUFDL0QsWUFDbUIsUUFBYSxFQUMvQixRQUFrQjtRQUVsQixLQUFLLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFUyxnQkFBZ0I7UUFDekIsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQywwQkFBMEI7SUFDaEYsQ0FBQzs7dUhBWFcsMEJBQTBCLGtCQUU3QixRQUFROzJIQUZMLDBCQUEwQixjQURiLE1BQU07MkZBQ25CLDBCQUEwQjtrQkFEdEMsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7OzBCQUcvQixNQUFNOzJCQUFDLFFBQVE7O0FBWWxCLE1BQU0sQ0FBQyxNQUFNLHNDQUFzQyxHQUFxQjtJQUN2RSxPQUFPLEVBQUUsZ0JBQWdCO0lBQ3pCLFdBQVcsRUFBRSwwQkFBMEI7Q0FDdkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgRXhpc3RpbmdQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgT3ZlcmxheUNvbnRhaW5lciB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IFBsYXRmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBHaG9zdFJpZGVyT3ZlcmxheUNvbnRhaW5lciBleHRlbmRzIE92ZXJsYXlDb250YWluZXIge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuXHRcdHBsYXRmb3JtOiBQbGF0Zm9ybSxcblx0KSB7XG5cdFx0c3VwZXIoZG9jdW1lbnQsIHBsYXRmb3JtKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlQ29udGFpbmVyKCk6IHZvaWQge1xuXHRcdHN1cGVyLl9jcmVhdGVDb250YWluZXIoKTtcblx0XHR0aGlzLl9jb250YWluZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2dob3N0LXJpZGVyJyk7IC8vIFRPRE86IE1ha2UgY29uZmlndXJhYmxlXG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IEdIT1NUX1JJREVSX09WRVJMQVlfQ09OVEFJTkVSX1BST1ZJREVSOiBFeGlzdGluZ1Byb3ZpZGVyID0ge1xuXHRwcm92aWRlOiBPdmVybGF5Q29udGFpbmVyLFxuXHR1c2VFeGlzdGluZzogR2hvc3RSaWRlck92ZXJsYXlDb250YWluZXIsXG59O1xuIl19