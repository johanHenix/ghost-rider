import { ElementRef, Injectable, Injector, ViewContainerRef } from '@angular/core';
import { Popover, GHOST_RIDER_POPOVER_STATIC_PROVIDER } from '../models/ghost-rider-popover.model';
import * as i0 from "@angular/core";
export class GhostRiderPopoverFactory {
    constructor(_injector) {
        this._injector = _injector;
    }
    createPopover(elementRef, config) {
        const providers = [
            GHOST_RIDER_POPOVER_STATIC_PROVIDER,
            { provide: ElementRef, useValue: elementRef },
        ];
        if (config) {
            if (config.vcr) {
                providers.push({ provide: ViewContainerRef, useValue: config.vcr });
            }
        }
        const instance = Injector.create({
            providers,
            parent: this._injector,
        }).get(Popover);
        // Not attached to, must manually run
        instance.ngOnInit();
        return instance;
    }
}
GhostRiderPopoverFactory.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderPopoverFactory, deps: [{ token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderPopoverFactory.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderPopoverFactory });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderPopoverFactory, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.Injector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItcG9wb3Zlci1mYWN0b3J5LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZy1naG9zdC1yaWRlci9zcmMvbGliL3Byb3ZpZGVycy9naG9zdC1yaWRlci1wb3BvdmVyLWZhY3Rvcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQWtCLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25HLE9BQU8sRUFBRSxPQUFPLEVBQUUsbUNBQW1DLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQzs7QUFPbkcsTUFBTSxPQUFPLHdCQUF3QjtJQUNwQyxZQUNrQixTQUFtQjtRQUFuQixjQUFTLEdBQVQsU0FBUyxDQUFVO0lBQ2pDLENBQUM7SUFFRSxhQUFhLENBQ25CLFVBQXNCLEVBQ3RCLE1BQWdDO1FBRWhDLE1BQU0sU0FBUyxHQUFxQjtZQUNuQyxtQ0FBbUM7WUFDbkMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7U0FDN0MsQ0FBQztRQUVGLElBQUksTUFBTSxFQUFFO1lBQ1gsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO2dCQUNmLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3BFO1NBQ0Q7UUFFRCxNQUFNLFFBQVEsR0FBZSxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzVDLFNBQVM7WUFDVCxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVM7U0FDdEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQWUsQ0FBQztRQUU5QixxQ0FBcUM7UUFDckMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXBCLE9BQU8sUUFBUSxDQUFDO0lBQ2pCLENBQUM7O3FIQTdCVyx3QkFBd0I7eUhBQXhCLHdCQUF3QjsyRkFBeEIsd0JBQXdCO2tCQURwQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWxlbWVudFJlZiwgSW5qZWN0YWJsZSwgSW5qZWN0b3IsIFN0YXRpY1Byb3ZpZGVyLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BvdmVyLCBHSE9TVF9SSURFUl9QT1BPVkVSX1NUQVRJQ19QUk9WSURFUiB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1wb3BvdmVyLm1vZGVsJztcblxuZXhwb3J0IGludGVyZmFjZSBHaG9zdFJpZGVyUG9wb3ZlckNvbmZpZyB7XG5cdHZjcjogVmlld0NvbnRhaW5lclJlZjtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEdob3N0UmlkZXJQb3BvdmVyRmFjdG9yeSB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgX2luamVjdG9yOiBJbmplY3Rvcixcblx0KSB7IH1cblxuXHRwdWJsaWMgY3JlYXRlUG9wb3ZlcjxUID0gYW55Pihcblx0XHRlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuXHRcdGNvbmZpZz86IEdob3N0UmlkZXJQb3BvdmVyQ29uZmlnLFxuXHQpOiBQb3BvdmVyPFQ+IHtcblx0XHRjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXG5cdFx0XHRHSE9TVF9SSURFUl9QT1BPVkVSX1NUQVRJQ19QUk9WSURFUixcblx0XHRcdHsgcHJvdmlkZTogRWxlbWVudFJlZiwgdXNlVmFsdWU6IGVsZW1lbnRSZWYgfSxcblx0XHRdO1xuXG5cdFx0aWYgKGNvbmZpZykge1xuXHRcdFx0aWYgKGNvbmZpZy52Y3IpIHtcblx0XHRcdFx0cHJvdmlkZXJzLnB1c2goeyBwcm92aWRlOiBWaWV3Q29udGFpbmVyUmVmLCB1c2VWYWx1ZTogY29uZmlnLnZjciB9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBpbnN0YW5jZTogUG9wb3ZlcjxUPiA9IEluamVjdG9yLmNyZWF0ZSh7XG5cdFx0XHRwcm92aWRlcnMsXG5cdFx0XHRwYXJlbnQ6IHRoaXMuX2luamVjdG9yLFxuXHRcdH0pLmdldChQb3BvdmVyKSBhcyBQb3BvdmVyPFQ+O1xuXG5cdFx0Ly8gTm90IGF0dGFjaGVkIHRvLCBtdXN0IG1hbnVhbGx5IHJ1blxuXHRcdGluc3RhbmNlLm5nT25Jbml0KCk7XG5cblx0XHRyZXR1cm4gaW5zdGFuY2U7XG5cdH1cbn0iXX0=