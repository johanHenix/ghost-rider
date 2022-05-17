# NgGhostRider

A library for creating guided tours in angular.
Ghost ride the whip!

Screenshots and GIFs coming soon!

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

### Local Dev
1. Fork and clone this repo
2. Build the package ```ng build ng-ghost-rider```
3. Run ```ng serve```for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
4. The dev environment should be up on port 4200!

## Build

Run `ng build ng-ghost-rider` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ng-ghost-rider`, go to the dist folder `cd dist/ng-ghost-rider` and run `npm publish`.

## Running unit tests

Run `ng test ng-ghost-rider` to execute the unit tests via [Karma](https://karma-runner.github.io).

## License

MIT License

Copyright (c) 2022 Freddy Silber <freddy.silber@gmail.com> (https://freddysilber.github.io/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
