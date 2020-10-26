import { SquareParams, MapParams, theme, generator } from './MapInterfaces';
import { Art, Position } from '../util/interfaces';
import { Actor } from '../actors/Actor';
import { Display, Random } from '../toolkit/toolkit';

/** Each square in the map */
export class Square {
    private baseArt : Art;
    public actor: Actor;
    public passable: boolean;
    public empty: boolean;
    // items?
    constructor(parameters: SquareParams) {
        this.parameters = parameters;
    }

    /** Get the current art for the square */
    get art():Art {
        if (this.actor) {
            return this.actor.art;
        }
        else {
            return this.baseArt;
        }
    }

    /** Set the square parameters */
    set parameters(parameters: SquareParams) {
        const {
            art,
            foreground='white',
            background='black',
            passable=true,
            empty=false,
            ...rest
        } = parameters;

        this.baseArt = {art, background, foreground};
        this.passable = passable;
        this.empty = empty;
    }
}

/** Individual room */
export class Room {
    public connections:Array<Room>;
    readonly position:Position;
    public name:string;
    public description:string;
    public exits: {
        north?: Room,
        south?: Room,
        east?: Room,
        west?: Room
    }

    constructor(position:Position, name?:string, description?:string) {
        if (!name) {name="Generic room";}
        if (!description) {description="A very normal room."}

        this.name=name;
        this.description=description;
        this.position = position;
        this.exits = {};
        this.connections = [];
    }
}

/** Map class */
export class Map {
    /** Object containing the map data */
    private mapData: Array<Square>;
    private width: number;
    private height: number;

    /** Entry and exit locations */
    public entrance: Position;
    public exit: Position;

    private display: Display;
    private random: Random;

    private rooms: Array<Room>;

    constructor(parameters: MapParams, display: Display, random: Random) {
        this.display = display;
        this.random = random;
        const {width=30, height=30, source, level=1, theme="default", ...rest} = parameters;
        let generator = (rest.generator) ? rest.generator : "default";

        // Check if a source was provided. If not, generator should be set to default
        // TODO: also check if source even exists and is valid
        if (!source && generator === "json") {
            generator = "default";
        }

        // Prepare the map
        this.width = Math.max(width,1);
        this.height = Math.max(height,1);
        this.allocateMap();

        this.rooms = [];

        // Generate
        if (generator === "default") {
            this.generateMap(generator, theme,0.75);
        }
    };

    /** Set up the starting squares and fill up the array of mapData */
    allocateMap() {
        this.mapData = [];
        const length = this.width * this.height;
        for (let i=0;i<length;i++) {
            this.mapData.push(new Square({
                art:"",
                passable:true,
                empty:true
            }));
        }
    };

    /** Get a specific square */
    getSquare(x:number,y:number) {
        if (x>=0 && x<this.width && y>=0 && y<this.height) {
            const index = x + y*this.width;
            return (this.mapData[index]);
        }
        else {
            return undefined;
        }
    }

    /** Draw the map */
    drawMap() {
        // Ensure the display is the correct size
        this.display.dimensions = {
            width:this.width,
            height:this.height
        }

        // Draw each tile
        for (let x=0;x<this.width;x++) {
            for (let y=0;y<this.height;y++) {
                const square = this.getSquare(x,y);
                const art = square.art;
                this.display.setTile(x,y,{
                    content:art.art,
                    foreground:art.foreground,
                    background:art.background
                });
            }
        }
    }

    /** Generate the map */
    generateMap(generator: generator, theme: theme, fillFraction:number) {
        console.log('Generating...');
        const targetSquares = fillFraction * this.width * this.height;
        let currentSquares=0;
        let maxIterations=100;
        while (currentSquares < targetSquares && maxIterations>=0) {
            maxIterations--;
            const width = this.random.getNumber(5,7);
            const height = this.random.getNumber(5,7);
            if (this.addRoom(
                {
                    x:this.random.getNumber(1,this.width-1),
                    y:this.random.getNumber(1,this.height-1)
                },
                width,
                height,
                {art:'#',foreground:'orange',background:'brown'},
                {art:'.',foreground:'green',background:'black'}
            )) {
                console.log('Added!(?)');
                currentSquares += width*height;
                // If this isn't the first room, get the most recently added room
                if (this.rooms.length > 1) {
                    const thisIndex = this.rooms.length-1;
                    const room = this.rooms[thisIndex];
                    // Make some connections
                    const connections = this.random.getNumber(1,Math.min(thisIndex,2),true);
                    for (let i=0;i<connections;i++) {
                        let index = -1;
                        let closestDistance = Infinity;
                        this.rooms.forEach((otherRoom, otherIndex) => {
                            // Not the same room, and not already connected
                            // TODO: Add a check for direction as well
                            if (thisIndex !== otherIndex && !room.connections.includes(otherRoom)) {
                                const distance = Math.abs(room.position.x - otherRoom.position.x)**2 + Math.abs(room.position.y - otherRoom.position.y)**2;
                                if (distance < closestDistance) {
                                    closestDistance = distance;
                                    index = otherIndex;
                                }
                            }
                        });
                        // Match found! Add a connection
                        if (index >= 0) {
                            room.connections.push(this.rooms[index]);
                            this.rooms[index].connections.push(room);
                            // TODO: Draw a hallway. Maybe have a this.rooms equivalent? (this.hallways?)
                        }
                    }
                }
            }
        }

        console.log(this.rooms);
    };

    /** Build a room */
    addRoom(position: Position, width: number, height: number, wall?: Art, floor?:Art):boolean {
        // Some defaults
        if (!wall) {
            wall = {
                art:'#',
                foreground:'white',
                background:'gray'
            }
        }
        if (!floor) {
            floor = {
                art:'.',
                foreground:'gray',
                background:'black'
            }
        }

        const boundaries = {
            left: Math.ceil(position.x - width/2),
            right: Math.ceil(position.x + width/2),
            top: Math.ceil(position.y - height/2),
            bottom: Math.ceil(position.y + height/2)
        };

        // First, determine if the room would even fit
        for (let i=boundaries.left; i<=boundaries.right; i++) {
            for (let j=boundaries.top; j<=boundaries.bottom; j++) {
                if (!this.getSquare(i,j) || !this.getSquare(i,j).empty) {
                    return false;
                }
            }
        }

        // Create a room object to go with this
        const room = new Room(position);

        // If it does, lets go ahead!
        for (let i=boundaries.left; i<=boundaries.right; i++) {
            for (let j=boundaries.top; j<=boundaries.bottom; j++) {
                if (i===boundaries.left || j===boundaries.top || i===boundaries.right || j===boundaries.bottom) {
                    this.getSquare(i,j).parameters = {
                        art: wall.art,
                        foreground: wall.foreground,
                        background: wall.background,
                        passable: false,
                    }
                }
                else {
                    this.getSquare(i,j).parameters = {
                        art: floor.art,
                        foreground: floor.foreground,
                        background: floor.background,
                        passable: true,
                    }
                }
            }
        }

        // Store room information
        this.rooms.push(room);

        return true;
    }
}