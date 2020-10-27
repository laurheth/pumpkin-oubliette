import { MapParams, theme, generator } from './MapInterfaces';
import { Art, Position } from '../util/interfaces';
import { Display, Random } from '../toolkit/toolkit';
import { Square } from './Square';
import { Room, Hallway, MapNode } from './dataStructures';
import { Player } from '../actors/Player';
import { Messenger } from '../messages/Messenger';

import { PathFinder, FOV } from '../toolkit/toolkit';

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

    private player: Player;

    readonly pathFinder: PathFinder;

    private fov: FOV;

    private messenger: Messenger;

    constructor(parameters: MapParams, display: Display, random: Random, player: Player, messenger: Messenger) {
        // Useful things from elsewhere in the app
        this.display = display;
        this.random = random;
        this.player = player;
        this.messenger = messenger;
        
        // Parameters and defaults
        const {width=30, height=30, source, level=1, theme="default", ...rest} = parameters;
        let generator = (rest.generator) ? rest.generator : "default";

        // Boot up the pathfinder
        this.pathFinder = new PathFinder({
            canPass: (pos:Array<number>)=>{
                const square = this.getSquare(pos[0],pos[1]);
                return square && square.passable;
            },
            maxIterations: width*height,
        });

        // Field of view
        this.fov = new FOV((position:Array<number>)=>{
            const square = this.getSquare(position[0],position[1]);
            if (square) {square.visible=true;}
            return square && square.passable;
        },8)

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
        this.hallways = [];

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

        // Center the view on the player
        this.display.centerDisplay(this.player.getPosition().x, this.player.getPosition().y);

        // Unsee the entire map
        for (let x=0;x<this.width;x++) {
            for (let y=0;y<this.height;y++) {
                const square = this.getSquare(x,y);
                if (square) {square.visible=false;}
            }
        }

        // Do FOV
        this.fov.look([this.player.getPosition().x, this.player.getPosition().y]);

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

    /** Get travel options */
    travelOptions(node:MapNode, position:Position) {
        // Current node is a room
        if (node instanceof Room) {
            node.connections.forEach(otherNode=>{

            });
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
                            // room.connections.push(this.rooms[index]);
                            // this.rooms[index].connections.push(room);
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

        // Untangle the mass of rooms + hallways, to figure out what's actually connected to what
        // Purge each rooms connections list
        this.rooms.forEach(room=>{
            room.connections = [];
        });

        // Every room connected to a hallway is connected to that hallway
        this.hallways.forEach(hallway=>{
            hallway.connections.forEach(room=>{
                if (!room.connections.includes(hallway)) {
                    room.connections.push(hallway);
                }
            });
        })
        
        console.log('rooms', this.rooms);
        console.log('hallways', this.hallways);

        // Add start and end
        const startRoom = this.random.getWeightedElement(
            this.rooms.map(room=>{
                return {
                    option: room,
                    weight: 10-room.connections.length
                }
            })
        );
        const endRoom = this.findMostDistantRoom(startRoom);
        
        this.entrance = startRoom.position;
        this.exit = endRoom.position;

        this.player.setPosition(this.entrance, this);
        
        this.getSquare(this.entrance.x, this.entrance.y).parameters = {
            art:'<',
            passable:true,
        };

        this.getSquare(this.exit.x, this.exit.y).parameters = {
            art:'>',
            passable:true,
        };

        this.postProcessing();
    };

    /** What the function */
    whatTheFuck() {
        this.mapData.forEach(square=>{
            if (this.hallways.indexOf(square.location as Hallway) >= 0) {
                square.parameters = {art:(this.hallways.indexOf(square.location as Hallway)).toString()}
            }
            // if (square.passable) {
            //     square.parameters = {art:'@'}
            // }
        })
    }

    /** Connectivity test */
    connectivityTest() {
        // Quick test for connectivity
        const nodes : Array<MapNode> = [];
        const testMaxIterations=10
        let iterations=0;
        let added=true;
        nodes.push(this.rooms[0]);
        const position = this.rooms[0].position;
        this.getSquare(position.x,position.y).parameters = {
            art: (1).toString()
        }
        while(added && iterations < testMaxIterations) {
            iterations++;
            added=false;
            const newNodes: Array<MapNode> = [];
            nodes.forEach(node=>{
                node.connections.forEach(otherNode=>{
                    if (!nodes.includes(otherNode) && !newNodes.includes(otherNode)) {
                        newNodes.push(otherNode);
                        added=true;
                    }
                });
            });
            newNodes.forEach(node=>{
                nodes.push(node)
                const position = node.position;
                if (this.getSquare(position.x,position.y)) {
                    this.getSquare(position.x,position.y).parameters = {
                        art: (iterations+1).toString()
                    }
                }
            });
        };
        console.log('test connections:', iterations, nodes);
    }

    /** Get node distance */
    nodeDistance(startNode: MapNode, endNode: MapNode): number {
        if (startNode === endNode) {
            return 0;
        }
        let steps=0;
        const nodes: Array<MapNode> = [];
        nodes.push(startNode);
        const limit = this.rooms.length + this.hallways.length;
        while (steps <= limit) {
            steps++;
            const newNodes: Array<MapNode> = [];
            nodes.forEach(node=>{
                node.connections.forEach(otherNode=>{
                    if (!nodes.includes(otherNode) && !newNodes.includes(otherNode)) {
                        newNodes.push(otherNode);
                    }
                });
            });
            for (const node of newNodes) {
                if (node === endNode) {
                    return steps;
                }
                nodes.push(node)
            }
        }
        return Infinity;
    };

    /** Get most distant node */
    findMostDistantRoom(startRoom: Room): Room {
        let index=-1;
        let maxDistance=0;

        this.rooms.forEach((room,i)=> {
            const distance = this.nodeDistance(startRoom,room);
            if (distance >= maxDistance) {
                maxDistance = distance;
                index=i;
            }
        });
        return this.rooms[index];
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
            // Determine if we're running into a weird corner
            const square1 = this.getSquare(currentPosition.x+axis.x,currentPosition.y+axis.y);
            const square2 = this.getSquare(currentPosition.x+2*axis.x,currentPosition.y+2*axis.y);
            if (!square1.passable && square1.location && !square2.passable && square2.location) {
                // Try some evasive maneuvers
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
                    const square = this.getSquare(position.x,position.y);
                    if (square) {
                        const location = square.location;
                        // Merge the hallways!
                        if ((i===0 || j===0) && square.passable && location && location instanceof Hallway) {
                            // This hallway has already been merged with another! Propogate backwards.
                            if (hallway && hallway !== location)  {
                                this.mergeHallways(location,hallway);
                            }
                            hallway = location;
                            // If this hallway is connected to our destination, we are done! Add an intersection
                            if (location.connections.includes(endRoom)) {
                                endPosition.x=currentPosition.x;
                                endPosition.y=currentPosition.y;
                            }
                        }
                    }
                    if (i===0 && j===0) {
                        floors.push(position);
                        // If hallway enters a room, end there
                        if (square && square.location instanceof Room && (square.location !== startRoom && square.location !== endRoom)) {
                            endPosition.x=currentPosition.x;
                            endPosition.y=currentPosition.y;
                            endRoom = square.location;
                        }
                    }
                }
            }
        }

        // No pre-existing hallway found, so declare a new one
        if (!hallway) {
            hallway = new Hallway();
            this.hallways.push(hallway);
        }
        if (!startRoom.connections.includes(endRoom)) {startRoom.connections.push(endRoom);}
        if (!endRoom.connections.includes(startRoom)) {endRoom.connections.push(startRoom);}

        // Figure out hallway connections
        if (!hallway.connections.includes(startRoom)) {
            hallway.connections.push(startRoom);
        }
        if (!hallway.connections.includes(endRoom)) {
            hallway.connections.push(endRoom);
        }

        // Draw the actual hallway
        // Start with the walls
        let squaresAdded=0;
        Object.values(walls).forEach(wallPosition=>{
            const square = this.getSquare(wallPosition.x,wallPosition.y);
            if (!square.passable && square.empty) {
                squaresAdded++;
                square.parameters = {
                    art: wall.art,
                    foreground: wall.foreground,
                    background: wall.background,
                    passable: false,
                    location: hallway,
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
                    location: hallway,
                };
            }
        });

        // Add the additional squares to the hallway definitions
        if (hallway && floorsAdded.length > 0) {
            hallway.addSquares(floorsAdded);
        }

        // Return number of squares added
        return squaresAdded;
    }

    /** Merge two hallways */
    mergeHallways(main: Hallway, other: Hallway) {
        // Update squares
        other.squarePositions.forEach(position=>{
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    const square = this.getSquare(position.x+i,position.y+j);
                    if (square.location === other) {
                        square.location = main;
                    }
                }
            }
        })
        // Combine square lists
        main.addSquares(other.squarePositions);
        // Combine connections
        other.connections.forEach(connection=>{
            if (!main.connections.includes(connection)) {
                main.connections.push(connection);
            }
        });
        // Remove other from the list
        this.hallways.splice(this.hallways.indexOf(other),1);
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
        for (let i=boundaries.left-1; i<=boundaries.right+1; i++) {
            for (let j=boundaries.top-1; j<=boundaries.bottom+1; j++) {
                if (!this.getSquare(i,j) || !this.getSquare(i,j).empty) {
                    return false;
                }
            }
        }

        // Create a room object to go with this
        const room = new Room(position);
        room.boundaries = boundaries;

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

    /** Post processing step, to add doors, etc */
    postProcessing() {
        for (let x=1;x<this.width-1;x++) {
            for (let y=1;y<this.height-1;y++) {
                const mainSquare = this.getSquare(x,y);
                let roomTiles = {
                    passable:0,
                    unPassable:0
                }
                let hallTiles = {
                    passable:0,
                    unPassable:0
                }

                for (let i=-1;i<2;i++) {
                    for (let j=-1;j<2;j++) {
                        if (i!==0 && j!== 0) {continue;}
                        const square = this.getSquare(x+i,y+j);
                        if (square.location && square.location instanceof Hallway) {
                            if (square.passable) {
                                hallTiles.passable++;
                            }
                            else {
                                hallTiles.unPassable++;
                            }
                        }
                        else if (square.location && square.location instanceof Room) {
                            if (square.passable) {
                                roomTiles.passable++;
                            }
                            else {
                                roomTiles.unPassable++;
                            }
                        }
                    }
                }
                if (mainSquare.location && mainSquare.location instanceof Hallway) {
                    // Door
                    if (roomTiles.passable===1 && roomTiles.unPassable===2 && hallTiles.passable===2) {
                        mainSquare.parameters={art:'+',passable:true,location:mainSquare.location};
                    }
                    else if (hallTiles.passable > 3 && roomTiles.passable===0 && roomTiles.unPassable===0) {
                        mainSquare.location.intersections.push({x:x,y:y});
                    }
                }
            }
        }
    }

    getRandomRoom():Position {
        const room = this.random.getRandomElement(this.rooms) as Room;
        return room.position;
    }
}