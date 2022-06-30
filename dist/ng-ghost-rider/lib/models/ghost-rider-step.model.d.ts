export declare class GhostRiderStep {
    name: string;
    readonly hasSubSteps: boolean;
    readonly subSteps: GhostRiderStep[];
    parent?: GhostRiderStep;
    hidden: boolean;
    constructor(name: string, ...steps: GhostRiderStep[]);
}
