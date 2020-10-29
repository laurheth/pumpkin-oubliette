import { Actor, allActors } from './Actor';
import { Goal } from './ActorInterfaces';
import { Messenger } from '../messages/Messenger';
import { Position } from '../util/interfaces';

/** The player! */
export class Player extends Actor {

    /** Sidebar where cool information goes */
    readonly sideBar: HTMLDivElement;

    private sideBarElements:{name:HTMLElement,title:HTMLElement,health:HTMLElement,mood:HTMLElement,inventory:HTMLUListElement};

    /** Resolution function to advance */
    finishTurn: (value?:unknown)=>void;

    private mood:string;

    private maxHealth:number;

    private inventory:Array<string>;

    constructor(messenger: Messenger, sideBar: HTMLDivElement) {
        super({
            name: "Franklin",
            title: "The Pumpkin Slayer",
            art: '@',
            messenger: messenger,
        });
        this.mood="Pumped up";
        this.health=10;
        this.maxHealth=10;
        this.sideBar = sideBar;
        this.inventory = ["A stick", "Trumpet"];
        this.sideBarElements = {
            name: sideBar.querySelector('#playerName'),
            title: sideBar.querySelector('#playerTitle'),
            health: sideBar.querySelector('#playerHealth'),
            mood: sideBar.querySelector('#playerMood'),
            inventory: sideBar.querySelector('#playerInventory'),
        };
    };
    
    /** Player turn */
    async act() {
        this.updateSidebar();
        this.map.drawMap();
        // Check if the player does not currently have any goals. Get a new action if not.
        if (!this.currentGoal) {
            // Promise to await player choice
            const playerActionPromise = new Promise(resolve=>{
                // Store the resolution function
                this.finishTurn = resolve;
            });

            // Determine directions the play can travel to
            const travelOptions = this.map.getTravelOptions(this.position);
            allActors.forEach(actor=>actor.getActionsOn(this,this.getAllTags()));
            console.log('Current node', this.map.getSquare(this.position.x,this.position.y).location, this.position);
            console.log('travelOptions', travelOptions);
            if (travelOptions.length>0) {
                travelOptions.forEach(option=>{
                    this.messenger.addAction({
                        description:option.direction,
                        callback:()=>{
                            this.currentGoal = {
                                target:option.position,
                                midTarget:option.midPosition
                            }
                            this.finishTurn();
                        }
                    });
                });
            }

            // Add to the messages
            // this.messenger.addMessage({message:"Testing?"});
    
            // Display current messages and actions
            this.messenger.generate();
    
            // Wait for the player's selection before advancing
            await playerActionPromise;
            this.messenger.clear();
        }
        // Framerate while executing an actions
        else {
            await new Promise(resolve=>{
                setTimeout(()=>resolve(),20);
            });
        }
        super.act();
    }

    /** Send a message about opening a door */
    doorOpenMessage() {
        this.messenger.addMessage({
            message:'You open the door...',
            importance:Infinity
        });
    }

    swapMessage(actor:Actor) {
        this.messenger.addMessage({
            message:`You jump past ${actor.name} the ${actor.title}!`,
            importance:Infinity
        });
    }

    /** Interrupt the players movement to let them know about something important */
    interruptTravel() {
        if (this.currentGoal && !this.currentGoal.action) {
            this.currentGoal = undefined;
            this.finishTurn();
        }
    }

    /** Update the sidebar */
    updateSidebar() {
        const {name,title,mood,health,inventory,...rest} = this.sideBarElements;

        name.textContent = this.name;
        title.textContent = this.title;
        mood.textContent = this.mood;
        health.textContent = `${this.health} / ${this.maxHealth}`;

        // Figure out inventory
        while(inventory.lastElementChild) {
            inventory.removeChild(inventory.lastElementChild);
        }

        // Add each item to the list
        this.inventory.forEach(item=>{
            const itemElement = document.createElement('li');
            itemElement.textContent = item;
            inventory.appendChild(itemElement);
        });
    }

    /** Get all tags */
    getAllTags():Array<string> {
        const tags:Array<string> = [];

        // TODO: Fill this in
        // Some logic here

        return tags;
    }

    die() {
        this.messenger.addMessage({message:`You die...`})
        this.remove();
        this.currentGoal=undefined;
    }
}