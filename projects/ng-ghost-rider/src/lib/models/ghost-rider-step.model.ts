export class GhostRiderStep {
  public readonly hasSubSteps: boolean = false;
  public readonly subSteps: GhostRiderStep[] = [];

  public parent?: GhostRiderStep;
  public hidden: boolean = false;

  constructor(
    public name: string,
    ...steps: GhostRiderStep[]
  ) {
    if (steps && steps.length) {
      this.hasSubSteps = true;
      this.subSteps = steps;

      steps.forEach((subStep) => {
        subStep.parent = this;
      });
    }
  }
}