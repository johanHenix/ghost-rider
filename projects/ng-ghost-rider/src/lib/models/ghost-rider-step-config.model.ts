import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';

type PopoverPosition = 'above' | 'right' | 'below' | 'left';
type PopoverNubbinPosition = 'auto';
type PopoverContent<T> = T extends string ? string : ComponentPortal<T> | TemplatePortal<T>;

export class GhostRiderStepConfig<T = any> {
  public name!: string;
  public title!: string;
  public backButtonLabel: string = 'Back';
  public nextButtonLabel: string = 'Next';

  public shouldRegister: boolean = true;
  public backIsDisabled: boolean = false;
  public nextIsDisabled: boolean = false;
  public nextIsHide: boolean = false;

  public position: PopoverPosition = 'below';
  public nubbinPosition: PopoverNubbinPosition = 'auto';
  public content!: PopoverContent<T>;

  /**
   * Function to run before the popover is shown. 'popover.show(0)'
   */
  beforeActivate?: () => unknown;
}