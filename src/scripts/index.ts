// Import styles
import '../styles/style.scss';
// Import the toolkit
import * as Toolkit from './toolkit/toolkit';

// Important imports
import { Actor } from './actors/Actor';
import { Player } from './actors/Player';
import { Map } from './map/Map';
import { Messenger } from './messages/Messenger';

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

    /** Random number generator */
    random: Toolkit.Random;

    /** Player character */
    player: Player;

    /** Map */
    map: Map;

    /** Messenger */
    messenger: Messenger;

    constructor() {
        // Select the important sections
        this.displayContainer = document.querySelector('#displayContainer');
        this.messageContainer = document.querySelector('#messages');
        this.sideBar = document.querySelector('#sideBar');

        // Create a new display object
        this.display = new Toolkit.Display({target: this.displayContainer, tileWidth:20});
        
        // Initialize the event manager
        this.eventManager = new Toolkit.EventManager({type:"complex"})

        // Initialize the prng.
        this.random = new Toolkit.Random();

        // Initialize the messenger
        this.messenger = new Messenger(this.messageContainer);

        // Create the player
        this.player = new Player(this.messenger);

        // Generate the map
        this.map = new Map({
            width: 60,
            height: 60,
        }, this.display, this.random, this.player,this.messenger);

        this.map.drawMap();

        // Some test actors
        const actor1 = new Actor({art:'g',name:'Goblin',messenger:this.messenger});
        const actor2 = new Actor({art:'g',name:'Goblin',messenger:this.messenger});

        this.eventManager.add({actor:this.player});
        this.eventManager.add({actor:actor1});
        this.eventManager.add({actor:actor2});

        this.play();
    }

    async play() {
        while (1===1) {
            await this.eventManager.advance();
        }
    }
}

const game = new Game();