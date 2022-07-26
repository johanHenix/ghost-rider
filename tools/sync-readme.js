const fs = require('fs');
const colors = require('colors');

// File destination.txt will be created or overwritten by default.
fs.copyFile(
	'README.md',
	'projects/ng-ghost-rider/README.md',
	(err) => {
		if (err) {
			throw err;
		}
		console.log(colors.green('README\'s are synced!'));
	}
);