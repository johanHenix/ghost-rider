/**
 * This enum defines how the actions of the tour work.
 * 
 * Start: starts the tour initially
 * 
 * Next: Goes to the next step in the tour
 * 
 * Back: Goes back to the previous step
 * 
 * Close: Closes the tour
 * 
 * Complete: Completes the tour and ends the program. It also emits an event to the client!
 * 
 * **Please add more**
 */
export enum GhostRiderEventType {
  Start,
  Next,
  Back,
  Close,
  Complete,
}

export enum GhostRiderEventSource {
  Directive,
  Popover,
  Manual,
}

export interface GhostRiderEvent {
  type: GhostRiderEventType | null;
  name: string;
  source: GhostRiderEventSource;
}