import { MapParams, theme, generator } from './MapInterfaces';
import { Art, Position } from '../util/interfaces';
import { Display, Random } from '../toolkit/toolkit';
import { Square } from './Square';
import { Room, Hallway } from './dataStructures';

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
    private hallways: Array<Hallway>;

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
                passable:false,
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
                            // TODO: Add a check for direction as well?
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
                            // Draw a hallway between the two rooms
                            currentSquares += this.drawHallway(
                                room,
                                this.rooms[index],
                                {art:'#',foreground:'gray',background:'#222222'},
                                {art:'.',foreground:'orange',background:'black'},
                            );
                        }
                    }
                }
            }
        }

        console.log(this.rooms);
    };

    /** Draw a hallway */
    drawHallway(startRoom: Room, endRoom: Room, wall?:Art, floor?: Art) : number {
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
        // Start position
        const currentPosition: Position = {...startRoom.position};
        const endPosition: Position = {...endRoom.position};
        // Determine current direction of travel
        const axis = {x:0,y:0};
        let dx = endPosition.x - currentPosition.x;
        let dy = endPosition.y - currentPosition.y;

        // Function to update axis
        const updateAxis = () => {
            if (Math.abs(dy) > Math.abs(dx)) {
                axis.y = dy / Math.abs(dy);
                axis.x = 0;
            }
            else {
                axis.x = dx / Math.abs(dx);
                axis.y = 0;
            }
        }

        updateAxis();

        // Positions to add to walls or floors
        const floors: Array<Position> = [];
        const walls: { [key: string]: Position } = {};

        // There will be a hallway object to contain this all, but we may not need a new one
        let hallway:Hallway;

        // Walk from current position to the new position
        while(currentPosition.x !== endPosition.x || currentPosition.y !== endPosition.y) {
            dx = endPosition.x - currentPosition.x;
            dy = endPosition.y - currentPosition.y;
            // Update step direction
            if (dx === 0 || dy === 0) {
                updateAxis();
            }
            // Step
            currentPosition.x += axis.x;
            currentPosition.y += axis.y;
            // Plan walls, and the floor
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    const position:Position = {
                        x: currentPosition.x + i,
                        y: currentPosition.y + j
                    }
                    walls[`${position.x},${position.y}`] = position;
                    if (i===0 && j===0) {
                        floors.push(position);
                        const square = this.getSquare(position.x,position.y);
                        if (square) {
                            const location = square.location;
                            if (square.passable && location instanceof Hallway) {
                                hallway = location;
                                // If this hallway is connected to our destination, we are done! Add an intersection
                                if (hallway.connections.includes(endRoom)) {
                                    endPosition.x=currentPosition.x;
                                    endPosition.y=currentPosition.y;
                                }
                            }
                        }
                    }
                }
            }
        }

        // No pre-existing hallway found, so declare a new one
        if (!hallway) {
            hallway = new Hallway();
        }

        // Figure out hallway connections
        if (!hallway.connections.includes(startRoom)) {
            hallway.connections.push(startRoom);
        }
        if (!hallway.connections.includes(endRoom)) {
            hallway.connections.push(endRoom);
        }

        // Draw the actual hallway
        // Start with the walls
        Object.values(walls).forEach(wallPosition=>{
            const square = this.getSquare(wallPosition.x,wallPosition.y);
            if (!square.passable && square.empty) {
                square.parameters = {
                    art: wall.art,
                    foreground: wall.foreground,
                    background: wall.background,
                    passable: false,
                    location: (square.location) ? square.location : hallway,
                };
            }
        });

        // Now, carve out the hallways
        const floorsAdded: Array<Position> = [];
        floors.forEach(floorPosition=>{
            const square = this.getSquare(floorPosition.x,floorPosition.y);
            if (!square.passable) {
                floorsAdded.push(floorPosition);
                square.parameters = {
                    art: floor.art,
                    foreground: floor.foreground,
                    background: floor.background,
                    passable: true,
                    location: (square.location) ? square.location : hallway,
                };
            }
        });

        // Add the additional squares to the hallway definitions
        if (hallway && floorsAdded.length > 0) {
            hallway.addSquares(floorsAdded);
        }

        console.log('hallway', hallway);
        console.log('floorsAdded', floorsAdded);

        // Return number of squares
        return 3*floorsAdded.length;
    }

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
                        location: room,
                    }
                }
                else {
                    this.getSquare(i,j).parameters = {
                        art: floor.art,
                        foreground: floor.foreground,
                        background: floor.background,
                        passable: true,
                        location: room,
                    }
                }
            }
        }

        // Store room information
        this.rooms.push(room);

        return true;
    }
}