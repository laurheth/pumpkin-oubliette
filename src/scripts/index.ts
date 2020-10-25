// Import styles
import '../styles/style.scss';

import Toolkit from './toolkit/toolkit';

// Select the important sections
const displayContainer: HTMLDivElement = document.querySelector('#displayContainer');
const messageContainer = document.querySelector('#messages');
const sideBar = document.querySelector('#sideBar');

// Create a new display object
const display = new Toolkit.Display({target: displayContainer, width: 20, height: 20, tileWidth:20});

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

display.setTile(12,10,{content:`🐌`});

display.centerDisplay(12,10);

// Test the event system a bit
const eventManager = new Toolkit.EventManager({type:"complex"})

class testActor {
    index:number;
    constructor(index:number) {
        this.index=index;
    }
    act() {
        console.log(`Actor ${this.index} is doing something!`);
    }
}

const actor1 = new testActor(1);
const actor2 = new testActor(2);

eventManager.add({actor:actor1,callback:()=>actor1.act(),repeats:true,delay:3});
eventManager.add({actor:actor2,callback:()=>actor2.act(),repeats:true,delay:9});
eventManager.add({callback:()=>console.log('Kablooie!'),delay:12});

for (let i=0;i<20;i++) {
    eventManager.advance();
}