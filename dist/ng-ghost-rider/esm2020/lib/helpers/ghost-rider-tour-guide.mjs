export class GhostRiderTourGuide {
    constructor(tourNamespace, steps) {
        this.tourNamespace = tourNamespace;
        this.steps = steps;
        this.currentStep = 0;
        this.steps.forEach((step) => {
            // Add the tour namespace to every step
            step.name = this.tourNamespace + step.name;
            if (step.hasSubSteps) {
                step.subSteps.forEach((subStep) => {
                    // Add the tour namespace to every sub step
                    subStep.name = this.tourNamespace + subStep.name;
                });
            }
        });
        this.activeStep = this.steps[0];
    }
    /**
     * Sets the active step to the next 'Parent' step that is visible
     */
    getNextStep() {
        const startingStep = this.activeStep;
        do {
            if (this.steps[this.currentStep + 1]) {
                this.currentStep++;
                this.activeStep = this.steps[this.currentStep];
            }
            else {
                return startingStep;
            }
        } while (this.activeStep.hidden);
        return this.activeStep;
        // do {
        // 	this.currentStep++;
        // 	this.activeStep = this.steps[this.currentStep];
        // } while (this.activeStep.hidden);
        // return this.activeStep;
    }
    /**
     * Sets the active step to the next sub step in the order
     */
    getNextSubStep() {
        if (this.activeStep.hasSubSteps) {
            this.activeStep = this.activeStep.subSteps[0];
        }
        else if (this.activeStep.parent) {
            const siblings = this.activeStep.parent.subSteps;
            this.activeStep = siblings[siblings.indexOf(this.activeStep) + 1];
        }
        return this.activeStep;
    }
    /**
     * Sets the active step to the previous 'Parent' step that is visible
     */
    getPreviousStep() {
        const startingStep = this.activeStep;
        do {
            if (this.steps[this.currentStep - 1]) {
                this.currentStep--;
                this.activeStep = this.steps[this.currentStep];
            }
            else {
                return startingStep;
            }
        } while (this.activeStep.hidden);
        return this.activeStep;
        // do {
        // 	this.currentStep--;
        // 	this.activeStep = this.steps[this.currentStep];
        // } while (this.activeStep.hidden);
        // return this.activeStep;
    }
    /**
     * Sets the active step to the previous sub step that is visible
     */
    getPreviousSubStep() {
        const siblings = this.activeStep.parent.subSteps;
        const previous = siblings.indexOf(this.activeStep) - 1;
        if (siblings[previous]) {
            this.activeStep = siblings[previous];
        }
        else if (this.activeStep.parent) {
            this.activeStep = this.activeStep.parent;
        }
        return this.activeStep;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItdG91ci1ndWlkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWdob3N0LXJpZGVyL3NyYy9saWIvaGVscGVycy9naG9zdC1yaWRlci10b3VyLWd1aWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sT0FBTyxtQkFBbUI7SUFJL0IsWUFDaUIsYUFBcUIsRUFDckIsS0FBdUI7UUFEdkIsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFDckIsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFKakMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFNOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUMzQix1Q0FBdUM7WUFDdkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFFM0MsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNqQywyQ0FBMkM7b0JBQzNDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNsRCxDQUFDLENBQUMsQ0FBQzthQUNIO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksV0FBVztRQUNqQixNQUFNLFlBQVksR0FBbUIsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNyRCxHQUFHO1lBQ0YsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMvQztpQkFBTTtnQkFDTixPQUFPLFlBQVksQ0FBQzthQUNwQjtTQUNELFFBQVEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7UUFFakMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRXZCLE9BQU87UUFDUCx1QkFBdUI7UUFDdkIsbURBQW1EO1FBQ25ELG9DQUFvQztRQUVwQywwQkFBMEI7SUFDM0IsQ0FBQztJQUVEOztPQUVHO0lBQ0ksY0FBYztRQUNwQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUM7YUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ2xDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNqRCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNsRTtRQUNELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN4QixDQUFDO0lBRUQ7O09BRUc7SUFDSSxlQUFlO1FBQ3JCLE1BQU0sWUFBWSxHQUFtQixJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3JELEdBQUc7WUFDRixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDckMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQy9DO2lCQUFNO2dCQUNOLE9BQU8sWUFBWSxDQUFDO2FBQ3BCO1NBQ0QsUUFBUSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtRQUVqQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFdkIsT0FBTztRQUNQLHVCQUF1QjtRQUN2QixtREFBbUQ7UUFDbkQsb0NBQW9DO1FBRXBDLDBCQUEwQjtJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxrQkFBa0I7UUFDeEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2xELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2RCxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNyQzthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztTQUN6QztRQUNELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN4QixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHaG9zdFJpZGVyU3RlcCB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1zdGVwLm1vZGVsJztcblxuZXhwb3J0IGNsYXNzIEdob3N0UmlkZXJUb3VyR3VpZGUge1xuXHRwdWJsaWMgYWN0aXZlU3RlcDogR2hvc3RSaWRlclN0ZXA7XG5cdHB1YmxpYyBjdXJyZW50U3RlcDogbnVtYmVyID0gMDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcmVhZG9ubHkgdG91ck5hbWVzcGFjZTogc3RyaW5nLFxuXHRcdHB1YmxpYyByZWFkb25seSBzdGVwczogR2hvc3RSaWRlclN0ZXBbXSxcblx0KSB7XG5cdFx0dGhpcy5zdGVwcy5mb3JFYWNoKChzdGVwKSA9PiB7XG5cdFx0XHQvLyBBZGQgdGhlIHRvdXIgbmFtZXNwYWNlIHRvIGV2ZXJ5IHN0ZXBcblx0XHRcdHN0ZXAubmFtZSA9IHRoaXMudG91ck5hbWVzcGFjZSArIHN0ZXAubmFtZTtcblxuXHRcdFx0aWYgKHN0ZXAuaGFzU3ViU3RlcHMpIHtcblx0XHRcdFx0c3RlcC5zdWJTdGVwcy5mb3JFYWNoKChzdWJTdGVwKSA9PiB7XG5cdFx0XHRcdFx0Ly8gQWRkIHRoZSB0b3VyIG5hbWVzcGFjZSB0byBldmVyeSBzdWIgc3RlcFxuXHRcdFx0XHRcdHN1YlN0ZXAubmFtZSA9IHRoaXMudG91ck5hbWVzcGFjZSArIHN1YlN0ZXAubmFtZTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFjdGl2ZVN0ZXAgPSB0aGlzLnN0ZXBzWzBdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGFjdGl2ZSBzdGVwIHRvIHRoZSBuZXh0ICdQYXJlbnQnIHN0ZXAgdGhhdCBpcyB2aXNpYmxlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0TmV4dFN0ZXAoKTogR2hvc3RSaWRlclN0ZXAge1xuXHRcdGNvbnN0IHN0YXJ0aW5nU3RlcDogR2hvc3RSaWRlclN0ZXAgPSB0aGlzLmFjdGl2ZVN0ZXA7XG5cdFx0ZG8ge1xuXHRcdFx0aWYgKHRoaXMuc3RlcHNbdGhpcy5jdXJyZW50U3RlcCArIDFdKSB7XG5cdFx0XHRcdHRoaXMuY3VycmVudFN0ZXArKztcblx0XHRcdFx0dGhpcy5hY3RpdmVTdGVwID0gdGhpcy5zdGVwc1t0aGlzLmN1cnJlbnRTdGVwXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBzdGFydGluZ1N0ZXA7XG5cdFx0XHR9XG5cdFx0fSB3aGlsZSAodGhpcy5hY3RpdmVTdGVwLmhpZGRlbik7XG5cblx0XHRyZXR1cm4gdGhpcy5hY3RpdmVTdGVwO1xuXG5cdFx0Ly8gZG8ge1xuXHRcdC8vIFx0dGhpcy5jdXJyZW50U3RlcCsrO1xuXHRcdC8vIFx0dGhpcy5hY3RpdmVTdGVwID0gdGhpcy5zdGVwc1t0aGlzLmN1cnJlbnRTdGVwXTtcblx0XHQvLyB9IHdoaWxlICh0aGlzLmFjdGl2ZVN0ZXAuaGlkZGVuKTtcblxuXHRcdC8vIHJldHVybiB0aGlzLmFjdGl2ZVN0ZXA7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgYWN0aXZlIHN0ZXAgdG8gdGhlIG5leHQgc3ViIHN0ZXAgaW4gdGhlIG9yZGVyXG5cdCAqL1xuXHRwdWJsaWMgZ2V0TmV4dFN1YlN0ZXAoKTogR2hvc3RSaWRlclN0ZXAge1xuXHRcdGlmICh0aGlzLmFjdGl2ZVN0ZXAuaGFzU3ViU3RlcHMpIHtcblx0XHRcdHRoaXMuYWN0aXZlU3RlcCA9IHRoaXMuYWN0aXZlU3RlcC5zdWJTdGVwc1swXTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuYWN0aXZlU3RlcC5wYXJlbnQpIHtcblx0XHRcdGNvbnN0IHNpYmxpbmdzID0gdGhpcy5hY3RpdmVTdGVwLnBhcmVudC5zdWJTdGVwcztcblx0XHRcdHRoaXMuYWN0aXZlU3RlcCA9IHNpYmxpbmdzW3NpYmxpbmdzLmluZGV4T2YodGhpcy5hY3RpdmVTdGVwKSArIDFdO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5hY3RpdmVTdGVwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGFjdGl2ZSBzdGVwIHRvIHRoZSBwcmV2aW91cyAnUGFyZW50JyBzdGVwIHRoYXQgaXMgdmlzaWJsZVxuXHQgKi9cblx0cHVibGljIGdldFByZXZpb3VzU3RlcCgpOiBHaG9zdFJpZGVyU3RlcCB7XG5cdFx0Y29uc3Qgc3RhcnRpbmdTdGVwOiBHaG9zdFJpZGVyU3RlcCA9IHRoaXMuYWN0aXZlU3RlcDtcblx0XHRkbyB7XG5cdFx0XHRpZiAodGhpcy5zdGVwc1t0aGlzLmN1cnJlbnRTdGVwIC0gMV0pIHtcblx0XHRcdFx0dGhpcy5jdXJyZW50U3RlcC0tO1xuXHRcdFx0XHR0aGlzLmFjdGl2ZVN0ZXAgPSB0aGlzLnN0ZXBzW3RoaXMuY3VycmVudFN0ZXBdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHN0YXJ0aW5nU3RlcDtcblx0XHRcdH1cblx0XHR9IHdoaWxlICh0aGlzLmFjdGl2ZVN0ZXAuaGlkZGVuKTtcblxuXHRcdHJldHVybiB0aGlzLmFjdGl2ZVN0ZXA7XG5cblx0XHQvLyBkbyB7XG5cdFx0Ly8gXHR0aGlzLmN1cnJlbnRTdGVwLS07XG5cdFx0Ly8gXHR0aGlzLmFjdGl2ZVN0ZXAgPSB0aGlzLnN0ZXBzW3RoaXMuY3VycmVudFN0ZXBdO1xuXHRcdC8vIH0gd2hpbGUgKHRoaXMuYWN0aXZlU3RlcC5oaWRkZW4pO1xuXG5cdFx0Ly8gcmV0dXJuIHRoaXMuYWN0aXZlU3RlcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBhY3RpdmUgc3RlcCB0byB0aGUgcHJldmlvdXMgc3ViIHN0ZXAgdGhhdCBpcyB2aXNpYmxlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0UHJldmlvdXNTdWJTdGVwKCk6IEdob3N0UmlkZXJTdGVwIHtcblx0XHRjb25zdCBzaWJsaW5ncyA9IHRoaXMuYWN0aXZlU3RlcC5wYXJlbnQhLnN1YlN0ZXBzO1xuXHRcdGNvbnN0IHByZXZpb3VzID0gc2libGluZ3MuaW5kZXhPZih0aGlzLmFjdGl2ZVN0ZXApIC0gMTtcblx0XHRpZiAoc2libGluZ3NbcHJldmlvdXNdKSB7XG5cdFx0XHR0aGlzLmFjdGl2ZVN0ZXAgPSBzaWJsaW5nc1twcmV2aW91c107XG5cdFx0fSBlbHNlIGlmICh0aGlzLmFjdGl2ZVN0ZXAucGFyZW50KSB7XG5cdFx0XHR0aGlzLmFjdGl2ZVN0ZXAgPSB0aGlzLmFjdGl2ZVN0ZXAucGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5hY3RpdmVTdGVwO1xuXHR9XG59XG4iXX0=