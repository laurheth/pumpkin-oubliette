// Import styles
import '../styles/style.scss';
// Import the toolkit
import * as Toolkit from './toolkit/toolkit';

/** Main Game Object */
class Game {
    /** Element holding the display */
    displayContainer: HTMLDivElement;
    /** Element where messages will be displayed */
    messageContainer: HTMLDivElement;
    /** Element used as the sidebar, for HP / name / etc */
    sideBar: HTMLDivElement;

    /** Main display object */
    display: Toolkit.Display;

    /** Main event scheduler */
    eventManager: Toolkit.EventManager;

    constructor() {
        // Select the important sections
        this.displayContainer = document.querySelector('#displayContainer');
        this.messageContainer = document.querySelector('#messages');
        this.sideBar = document.querySelector('#sideBar');

        // Create a new display object
        this.display = new Toolkit.Display({target: this.displayContainer, width: 20, height: 20, tileWidth:20});
        
        for (let i=0;i<20;i++) {
            for (let j=0;j<20;j++) {
                if (i===0 || j===0 || i===19 || j===19) {
                    this.display.setTile(i,j,{content:'#'});
                }
                else {
                    this.display.setTile(i,j,{content:'.'});
                }
            }
        }
        
        this.display.setTile(12,10,{content:`🐌`});
        
        this.display.centerDisplay(12,10);
        
        // Test the event system a bit
        this.eventManager = new Toolkit.EventManager({type:"complex"})
        
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
        
        this.eventManager.add({actor:actor1,callback:()=>actor1.act(),repeats:true,delay:3});
        this.eventManager.add({actor:actor2,callback:()=>actor2.act(),repeats:true,delay:9});
        this.eventManager.add({callback:()=>console.log('Kablooie!'),delay:12});
        
        for (let i=0;i<20;i++) {
            this.eventManager.advance();
        }

    }
}

const game = new Game();