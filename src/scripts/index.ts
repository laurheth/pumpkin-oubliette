// Import styles
import '../styles/style.scss';

import Toolkit from './toolkit/toolkit';

// Select the important sections
const displayContainer: HTMLDivElement = document.querySelector('#displayContainer');
const messageContainer = document.querySelector('#messages');
const sideBar = document.querySelector('#sideBar');

// Create a new display object
const display = new Toolkit.Display({target: displayContainer, width: 40, height: 30, tileWidth:16});

display.tileSize = display.calculateTileSize();

// Keep track of resize events
window.addEventListener('resize', ()=>{
    display.tileSize = display.calculateTileSize();
});