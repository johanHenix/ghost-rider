import { Component } from '@angular/core';

@Component({
	selector: 'github-corner',
	templateUrl: 'github-corner.component.html',
	styleUrls: ['github-corner.component.scss']
})
export class GithubCorner {
	public readonly link: string = 'https://github.com/ng-ghost-rider/ghost-rider';
}