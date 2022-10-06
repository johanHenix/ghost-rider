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

/**
 * GhostRiderEventSource
 */
export enum GhostRiderEventSource {
  Directive,
  Popover,
  Manual,
}

/**
 * GhostRiderEvent
 * 
 * Retains an object that can be used from external sources
 * @param type - Type of event (next, back etc.)
 * @param name - String for the event name (can be a custom name)
 * @param source - Where the event was 'sourced' from (Directive, Popover, Manual etc.)
 */
export interface GhostRiderEvent {
  type: GhostRiderEventType | null;
  name: string;
  source: GhostRiderEventSource;
}