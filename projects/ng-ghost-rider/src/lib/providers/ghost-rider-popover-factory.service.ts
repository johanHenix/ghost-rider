import { ElementRef, Injectable, Injector, StaticProvider, ViewContainerRef } from '@angular/core';
import { Popover, GHOST_RIDER_POPOVER_STATIC_PROVIDER } from '../models/ghost-rider-popover.model';

export interface GhostRiderPopoverConfig {
	vcr: ViewContainerRef;
}

@Injectable()
export class GhostRiderPopoverFactory {
	constructor(
		private readonly _injector: Injector,
	) { }

	public createPopover<T = any>(
		elementRef: ElementRef,
		config?: GhostRiderPopoverConfig,
	): any {
		const providers: StaticProvider[] = [
			GHOST_RIDER_POPOVER_STATIC_PROVIDER,
			{ provide: ElementRef, useValue: elementRef },
		];

		if (config) {
			if (config.vcr) {
				providers.push({ provide: ViewContainerRef, useValue: config.vcr });
			}
		}

		const instance: Popover<T> = Injector.create({
			providers,
			parent: this._injector,
		}).get(Popover) as Popover<T>;

		// Not attached to, must manually run
		instance.ngOnInit();

		return instance;
	}
}