# NgGhostRider

A library for creating guided tours in angular.
Ghost ride the whip!

## Usage

1. Run ```npm i ng-ghost-rider```

2. Add the module to your application
```javascript
@NgModule({
  declarations: [
    AppComponent
],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GhostRiderModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

3. Then, set up any elements you want to be used as steps
```html
<!-- These directives can be placed anywhere in you application -->
<h1 [ghostRiderStep]="{
  name: 'tour.firstStep',
	title: 'Step 1 title',
  content: 'Step 1 content'
}">
  Step 1
</h1>

<h1 [ghostRiderStep]="{
  name: 'tour.secondStep',
  title: 'Step 2 title',
  content: 'Step 2 content'
}">
  Step 2
</h1>
```

4. Inject the **GhostRiderService** into the component that you'd like to start the tour from
```javascript
import { Component } from '@angular/core';
import { GhostRiderService, GhostRiderStep } from 'ng-ghost-rider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) {
    this._ghostRiderService.start(
      'tour',
      [
        new GhostRiderStep('firstStep'),
        new GhostRiderStep('secondStep'),
        // Optionally provide sub steps (for inner steps within the parent step)
        new GhostRiderStep(
          'thirdStepWithSubSteps',
          [
            new GhostRiderStep('firstSubStep'),
            new GhostRiderStep('secondSubStep'),
          ]
        )
      ]
    );
  }
}
```

5. Enjoy the ride!

## Contributing
Feel free to report any bugs / issues [here](https://github.com/freddysilber/ghost-rider/issues)

## Build

Run `ng build ng-ghost-rider` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ng-ghost-rider`, go to the dist folder `cd dist/ng-ghost-rider` and run `npm publish`.

## Running unit tests

Run `ng test ng-ghost-rider` to execute the unit tests via [Karma](https://karma-runner.github.io).
