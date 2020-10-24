import { takeWhile } from 'lodash';
import css from './Display.module.scss';
import { DisplayParams, TileSize, Dimension, TileOptions, Position } from './DisplayInterfaces';
import { Tile } from './Tile';

/** Display class, to create and control a display */
class Display {
    private _width: number;
    private _height: number;
    private target: HTMLDivElement;
    readonly element: HTMLDivElement;
    private tiles: Array<Tile>;
    private centerPosition: Position;
    private _background: string;
    private _foreground: string;

    private _tileSize: TileSize;

    /** Create a new Display
     *  @param {DisplayParams} parameters - Object of parameters to initialize the display.
     */
    constructor(
        parameters: DisplayParams
    ) {
        const {target, width, height, background, foreground, tileWidth, tileHeight, ...rest} = parameters;
        // Set the target
        this.target = target;

        // Create the element for the display
        this.element = document.createElement('div');
        
        // Apply some default styles
        this.element.classList.add(css.display);
        this.background = (background) ? background : '#000000';
        this.foreground = (foreground) ? foreground : '#ffffff';

        // Set the display dimensions
        this.dimensions = {width, height};
        this.tileSize = {
            tileWidth: (tileWidth) ? tileWidth : 16,
            tileHeight: (tileHeight) ? tileHeight : (tileWidth) ? tileWidth : 16
        };

        // Attach display to the target element
        this.target.classList.add(css.displayContainer);
        this.target.appendChild(this.element);
    };

    /** Tile size */
    get tileSize(): TileSize {
        return this._tileSize;
    };

    set tileSize(newTileSize: TileSize) {
        this._tileSize = newTileSize;
        this.element.style.fontSize = `${newTileSize.tileHeight}px`;
        this.tiles?.forEach(tile=>{
            tile.tileWidth = newTileSize.tileWidth;
            tile.tileHeight = newTileSize.tileHeight;
            tile.position = tile.position;
        });
        this.resetSize();
    };

    /** Get or set the display dimensions */
    get dimensions(): Dimension {
        return {width: this._width, height:this._height};
    };

    set dimensions(newDimensions: Dimension) {
        if (newDimensions.width !== this._width && newDimensions.height !== this._height) {
            this._width = newDimensions.width;
            this._height = newDimensions.height;
            // Reset the display to accomodate the new size
            this.allocateDisplay();
            this.resetSize();
            this.moveToCenter();
        }
    };

    /** Reset display element size */
    resetSize() {
        if (this._width && this._height && this.tileSize) {
            this.element.style.width = `${this._width * this.tileSize.tileWidth}px`;
            this.element.style.height = `${this._height * this.tileSize.tileHeight}px`;
        }
    }

    /** Background colour */
    get background(): string {
        return this._background;
    };

    set background(newBackground: string) {
        this._background = newBackground;
        this.element.style.background = newBackground;
        this.target.style.background = newBackground;
    };

    /** Foreground colour */
    get foreground(): string {
        return this._foreground;
    };

    set foreground(newForeground: string) {
        this._foreground = newForeground;
        this.element.style.color = newForeground;
    };

    /** Position to center the display view on */
    centerDisplay(x?: number, y?: number) {
        if (typeof x === "undefined" || typeof y === "undefined") {
            this.centerPosition = undefined;
        }
        else {
            this.centerPosition = {
                x: x,
                y: y
            }
        }
        this.moveToCenter();
    }

    private moveToCenter() {
        if (this.centerPosition) {
            const xPercent = (this.centerPosition.x + 0.5) / this.dimensions.width;
            const yPercent = (this.centerPosition.y + 0.5) / this.dimensions.height;
            this.element.style.transform = `translate(${-xPercent*100}%,${-yPercent*100}%)`;
        }
        else {
            this.element.style.transform = "";
        }
    }

    /** Build the array of tiles and attach them to the display */
    allocateDisplay() {
        // Start a fresh tiles array
        this.tiles = [];

        // Empty display if it has contents already (REFACTOR THIS LATER)
        while(this.element.lastElementChild) {
            this.element.removeChild(this.element.lastElementChild);
        }

        // Generate tiles
        for (let y=0;y<this._height;y++) {
            for (let x=0;x<this._width;x++) {
                // Make a new tile
                const newTile = new Tile(
                    {
                        content:'#',
                        background:this.background,
                        foreground:this.foreground
                    },
                    {x:x,y:y},
                    this.tileSize
                );
                // Add it to the list of tiles
                this.tiles.push(newTile);
                // Append to the actual display
                this.element.appendChild(newTile.element);
            }
        }
    };

    /** Get the display tile at the specified position
     * @param {number} x - Position from the left side of the display
     * @param {number} y - Position from the top of the display
    */
    getTile(x:number, y:number) : Tile | undefined {
        if (x>=0 && x<this._width && y>=0 && y<this._height) {
            const index = x + y * this._width;
            return this.tiles[index];
        }
        else {
            return undefined;
        }
    };

    /** Set details for the specified tile */
    setTile(x:number, y:number, newOptions:TileOptions) {
        const tile = this.getTile(x,y);
        if (tile) {
            tile.setOptions(newOptions);
        }
    };

    /** Given the size of the target container, and the tile size, determine the number of tiles needed. */
    calculateDimensions(clientRect = this.target.getBoundingClientRect()) : Dimension {
        const clientWidth = Math.abs(clientRect.right - clientRect.left);
        const clientHeight = Math.abs(clientRect.bottom - clientRect.top);
        // Round down; we do not want partial tiles
        return {
            width: Math.floor(clientWidth / this.tileSize.tileWidth),
            height: Math.floor(clientHeight / this.tileSize.tileHeight)
        }
    };

    /** Given the size of the target container, and the number of tiles, determine the tile size needed
     *  This assumes square tiles are desired.
    */
    calculateTileSize(clientRect = this.target.getBoundingClientRect()) : TileSize {
        const clientWidth = Math.abs(clientRect.right - clientRect.left);
        const clientHeight = Math.abs(clientRect.bottom - clientRect.top);
        // This could potentially give absurd results, so get the "naive first-guess" here
        const size : TileSize = {
            tileWidth: clientWidth / this.dimensions.width,
            tileHeight: clientHeight / this.dimensions.height
        }

        // Choose the lowest of the two. This is the maximum square tile size that will fit the given dimensions
        const maxTileSize = Math.min(size.tileWidth, size.tileHeight);

        // Don't bother rounding; fonts can be precise numbers
        return {
            tileWidth: maxTileSize,
            tileHeight: maxTileSize
        }
    };
};

export default Display;