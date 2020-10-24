// Import styles
import '../styles/style.scss';

import Toolkit from './toolkit/toolkit';

// Put something onto the page
const appRoot: HTMLDivElement = document.querySelector('#appRoot');

// Create a new display object
const display = new Toolkit.Display({target: appRoot, width: 40, height: 30, tileWidth:16});

// display.dimensions = display.calculateDimensions();
display.tileSize = display.calculateTileSize();