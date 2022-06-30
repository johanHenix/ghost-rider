import { PopoverContent, PopoverNubbinPosition, PopoverPosition } from './ghost-rider-popover.model';
export declare class GhostRiderStepConfig<T = any> {
    name: string;
    title: string;
    backButtonLabel: string;
    nextButtonLabel: string;
    shouldRegister: boolean;
    backIsDisabled: boolean;
    nextIsDisabled: boolean;
    nextIsHide: boolean;
    position: PopoverPosition;
    nubbinPosition: PopoverNubbinPosition;
    content: PopoverContent<T>;
    /**
     * Function to run before the popover is shown. 'popover.show(0)'
     */
    beforeActivate?: () => unknown;
}
