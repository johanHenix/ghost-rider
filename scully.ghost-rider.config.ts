import { ScullyConfig } from '@scullyio/scully';
import '@scullyio/scully-plugin-puppeteer';

export const config: ScullyConfig = {
	projectRoot: './src',
	projectName: 'ghost-rider',
	outDir: './dist/static',
	routes: {},
};