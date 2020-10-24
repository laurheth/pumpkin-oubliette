import css from './Display.module.scss';
import { DisplayParams, TileSize, Dimension } from './DisplayInterfaces';
import { Tile } from './Tile';

/** Display class, to create and control a display */
class Display {
    private _width: number;
    private _height: number;
    private target: HTMLDivElement;
    readonly element: HTMLDivElement;
    private tiles: Array<Tile>;

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
            tileWidth: (tileWidth) ? tileWidth : '1rem',
            tileHeight: (tileHeight) ? tileHeight : (tileWidth) ? tileWidth : '1rem'
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
        this.element.style.fontSize = newTileSize.tileHeight;
        this.tiles?.forEach(tile=>{
            tile.tileWidth = newTileSize.tileWidth;
            tile.tileHeight = newTileSize.tileHeight;
        });

        this.element.style.width = `calc(${this._width} * ${newTileSize.tileWidth})`;
        this.element.style.height = `calc(${this._height} * ${newTileSize.tileHeight})`;
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
        }
    };

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

    /** Build the array of tiles and attach them to the display */
    allocateDisplay() {
        // Start a fresh tiles array
        this.tiles = [];

        // Generate tiles
        for (let y=0;y<this._height;y++) {
            for (let x=0;x<this._width;x++) {
                // Make a new tile
                const newTile = new Tile('#',this.background,this.foreground,{x:x,y:y},this.tileSize);
                // Add it to the list of tiles
                this.tiles.push(newTile);
                // Append to the actual display
                this.element.appendChild(newTile.element);
            }
        }
    };

};

export default Display;