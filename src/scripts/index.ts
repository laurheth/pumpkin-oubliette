// Import styles
import '../styles/style.scss';

import Toolkit from './toolkit/toolkit';

// Select the important sections
const displayContainer: HTMLDivElement = document.querySelector('#displayContainer');
const messageContainer = document.querySelector('#messages');
const sideBar = document.querySelector('#sideBar');

// Create a new display object
const display = new Toolkit.Display({target: displayContainer, width: 20, height: 20, tileWidth:16});

for (let i=0;i<20;i++) {
    for (let j=0;j<20;j++) {
        if (i===0 || j===0 || i===19 || j===19) {
            display.setTile(i,j,{content:'#'});
        }
        else {
            display.setTile(i,j,{content:'.'});
        }
    }
}

display.centerDisplay(1,1);