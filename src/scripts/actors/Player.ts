import { Actor, allActors } from './Actor';
import { Goal } from './ActorInterfaces';
import { Messenger, Action } from '../messages/Messenger';
import { Position } from '../util/interfaces';
import { Item } from '../items/Item';
import { MapNode } from '../map/dataStructures';
import { Map } from '../map/Map';
/** The player! */
export class Player extends Actor {

    /** Sidebar where cool information goes */
    readonly sideBar: HTMLDivElement;

    private sideBarElements:{name:HTMLElement,title:HTMLElement,health:HTMLElement,mood:HTMLElement,inventory:HTMLUListElement};

    /** Resolution function to advance */
    finishTurn: (value?:unknown)=>void;

    private moodNum:number;
    private mood:string;

    private maxHealth:number;

    private inventory:Array<Item>;

    public alive:boolean;

    private mortalPeril:boolean;

    private record: {
        kills:number,
        friendships:number,
        betrayals:number,
        pets:number,
    }

    private currentMapNode:MapNode;

    constructor(messenger: Messenger, sideBar: HTMLDivElement) {
        super({
            name: "Franklin",
            title: "The Explorer",
            art: '@',
            messenger: messenger,
        });
        this.sideBar = sideBar;
        this.inventory = [];
        this.sideBarElements = {
            name: sideBar.querySelector('#playerName'),
            title: sideBar.querySelector('#playerTitle'),
            health: sideBar.querySelector('#playerHealth'),
            mood: sideBar.querySelector('#playerMood'),
            inventory: sideBar.querySelector('#playerInventory'),
        };
        this.setDefaults();
    };

    setDefaults() {
        this.maxHealth=10;
        this.health=10;
        this.moodNum=0;
        this.record={
            kills:0,
            friendships:0,
            betrayals:0,
            pets:0
        };
        this.attack=2;
        this.defense=2;
        this.inventory=[];
        this.actionsOn = [];
        this.alive=true;
        this.mortalPeril=false;
    }
    
    /** Player turn */
    async act() {
        // Check health...
        if (this.health > this.maxHealth) {
            this.health = Math.min(this.health,this.maxHealth);
        }
        else if (this.health < this.maxHealth/2 && !this.mortalPeril) {
            this.mortalPeril=true;
            this.messenger.addMessage({message:"You are below half health!"});
        }
        else if (this.health > this.maxHealth/2 && this.mortalPeril) {
            this.mortalPeril=false;
            this.messenger.addMessage({message:"You feel somewhat healthier."});
        }
        this.updateMood();
        this.updateSidebar();
        this.map.drawMap();
        // Check if the player does not currently have any goals. Get a new action if not.
        if (!this.currentGoal && this.alive) {
            // Promise to await player choice
            const playerActionPromise = new Promise(resolve=>{
                // Store the resolution function
                this.finishTurn = resolve;
            });

            // Check if the stairs are in sight
            this.map.stairsTest();

            // Determine directions the play can travel to, and all available actions
            const travelOptions = this.map.getTravelOptions(this.position);
            allActors.forEach(actor=>{
                actor.getActionsOn(this,this.getAllTags())
            });
            if (travelOptions.length>0) {
                const travelActions:Array<Action> = [];
                travelOptions.forEach(option=>{
                    travelActions.push({
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
                if (travelActions.length>0) {
                    this.messenger.addActionList('Travel',travelActions);
                }
            }

            // Add to the messages
            // this.messenger.addMessage({message:"Testing?"});
    
            // Display current messages and actions
            // this.messenger.generate();
            this.messenger.showActions();
    
            // Wait for the player's selection before advancing
            await playerActionPromise;
            // Clear old messages
            this.messenger.clear();
            // Clear old actions list
            this.messenger.clearActions();
        }
        // Framerate while executing an actions
        else {
            await new Promise(resolve=>{
                setTimeout(()=>resolve(),100);
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
        if (this.health <= 0) {
            health.style.color='red';
        }
        else if (this.health < this.maxHealth/2) {
            health.style.color='yellow';
        }
        else {
            health.style.color='';
        }

        // Figure out inventory
        while(inventory.lastElementChild) {
            inventory.removeChild(inventory.lastElementChild);
        }

        // Add each item to the list
        if (this.inventory.length>0) {
            this.inventory.forEach(item=>{
                const itemElement = document.createElement('li');
                itemElement.textContent = item.name;
                inventory.appendChild(itemElement);
            });
        }
        else {
            const itemElement = document.createElement('li');
            itemElement.textContent = "No items currently held.";
            inventory.appendChild(itemElement);
        }
    }

    /** Get all tags */
    getAllTags():Array<string> {
        const tags:Array<string> = [];

        this.inventory.forEach(item=>{
            item.getTags().forEach(tag=>tags.push(tag));
        })

        return tags;
    }

    die() {
        this.updateSidebar();
        this.messenger.addMessage({message:`You die...`});
        this.map.nameGen.addGhost(this.name,true);
        this.messenger.clearActions();
        this.messenger.showActions([{
            description: "Try again?",
            callback:()=>{
                this.messenger.clear();
                this.messenger.clearActions();
                this.map.restartGame();
            }
        }]);
        this.alive=false;
        this.map.drawMap();
        this.currentGoal=undefined;
    }

    /** Pick up item */
    addInventory(item:Item) {
        // Check if a copy exists, and consolidate the two if so
        const index = this.inventory.map(item=>item.name).indexOf(item.name)
        if (index >= 0) {
            this.inventory[index].uses+=item.uses;
        }
        else {
            this.inventory.push(item);
            this.updateSidebar();
        }
    }

    /** Check if player has an item */
    hasItem(item:Item):boolean {
        return this.inventory.map(item=>item.name).includes(item.name);
    }

    /** Drop an item */
    removeInventory(item:Item) {
        const index = this.inventory.indexOf(item);
        if (index>=0) {
            this.inventory.splice(index,1);
            this.updateSidebar();
        }
    }

    /** Expend uses of an appropriate item */
    useRelevant(conditions:string|Array<string>) {
        if (typeof conditions === "string") {
            conditions = [conditions];
        }
        const filteredConditions = conditions.filter(condition=>condition !== "hostile" && condition !== "friendly" && condition !== "neutral");

        // Non-attitude conditions exist
        if (filteredConditions.length>0) {
            const inventoryCopy = [...this.inventory];
            // Go from fewest tags to most, to expend uses on the least useful items first
            inventoryCopy.sort((b,a)=>b.getTags().length - a.getTags().length);
            // Find first item that covers all of the conditions
            for (const item of inventoryCopy) {
                if (filteredConditions.every(condition=>item.getTags().includes(condition))) {
                    // Found, burn a use. We are done!
                    item.use();
                    break;
                }
            }
        }
    }

    /** Update record */
    updateRecord(action:"kills"|"betrayals"|"friendships"|"pets") {
        this.record[action]++;
        const score = this.record.friendships + this.record.pets - 2*this.record.kills - 2*this.record.betrayals;
        if (score <= 0) {
            if (this.record.betrayals > 10) {
                this.title="The Pumpkin Betrayer";
            }
            else if (score <-50) {
                this.title="Blood Soaked Pumpkin Carver"
            }
            else if (score<-30) {
                this.title="Enemy to All Pumpkins";
            }
            else if (score<-10) {
                this.title="The Pumpkin Slayer";
            }
            else {
                this.title="The Adventurer";
            }
        }
        else {
            if (this.record.pets > 20) {
                this.title="Cuddler of Pumpkins";
            }
            else if (this.record.friendships > 50) {
                this.title="Friend to All Pumpkins";
            }
            else if (this.record.friendships > 10) {
                this.title="The Pumpkin Befriender";
            }
            else {
                this.title="The Explorer";
            }
        }
    }

    /** Update mood */
    updateMood(adjustment?:number){
        if (adjustment) {
            this.moodNum -= adjustment;
        }
        else {
            this.moodNum *= 0.99;
        }
        if (this.moodNum > 100) {
            this.mood="Terrified";
        }
        else if (this.moodNum > 50) {
            this.mood="Afraid";
        }
        else if (this.moodNum > 20) {
            this.mood="Nervous";
        }
        else if (this.moodNum > -20) {
            this.mood="Steady";
        }
        else if (this.moodNum > -40) {
            this.mood="Content";
        }
        else if (this.moodNum > -100) {
            this.mood="Happy";
        }
        else {
            this.mood="Ecstatic";
        }
    }

    /** Additional details for set position */
    setPosition(position: Position, map?:Map): boolean {
        const success = super.setPosition(position,map);
        // Update some map node information
        if (success && this.position && this.map) {
            const square = this.map.getSquare(this.position.x,this.position.y);
            const newLocation = square.location;
            if (newLocation) {
                this.messenger.setHeading(newLocation.name);
                if (newLocation !== this.currentMapNode) {
                    this.currentMapNode = newLocation;
                    this.messenger.addMessage({message:newLocation.description});
                }
            }
        }
        return success;
    }

    /** A rating of how violent the player is */
    getViolenceRating():number {
        const baseNum = Math.max(0,3*this.record.kills - this.record.friendships - this.record.pets);
        return Math.ceil(Math.sqrt(baseNum));
    }

    /** Increate max health */
    increaseMaxHealth(num:number) {
        this.maxHealth += num;
        this.health += num;
        this.updateSidebar();
    }
}