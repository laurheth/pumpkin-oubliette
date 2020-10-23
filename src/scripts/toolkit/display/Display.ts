import css from './Display.scss';

/** Display parameters */
interface DisplayParams {
    /** Target div to use as the display. */
    target: HTMLDivElement;
    /** Width in tiles of the display. */
    width: number;
    /** Height in tiles of the display. */
    height: number;
    /** Optional width of each tile. */
    tileWidth?: string;
    /** Optional height of each tile. */
    tileHeight?: string;
    /** Default background colour of the display */
    background?: string;
    /** Default foreground colour of the display */
    foreground?: string;
}

/** dimensions interface */
interface Dimension {
    width: number;
    height: number;
};

/** Tilesize interface */
interface TileSize {
    tileWidth: string;
    tileHeight: string;
}

/** Position interface */
interface Position {
    x: number,
    y: number
}

/** Class to keep track of each individual tile in the display */
class Tile {
    /** Contents of the tile  */
    private contentElement: HTMLElement;
    private _content: string | HTMLElement;
    /** Background colour. */
    private _background: string;
    /** Foreground colour */
    private _foreground: string;

    /** Position */
    private _position: Position;

    /** Size of a title, in CSS units */
    private _tileHeight: string;
    private _tileWidth: string;

    /** Element this tile corresponds to in the DOM */
    readonly element: HTMLDivElement;

    constructor(
        content: string | HTMLElement,
        background: string,
        foreground: string,
        position: Position,
        tileSize?: TileSize,
    ) {
        // Create necessary elements and apply classes
        this.element = document.createElement('div');
        this.element.classList.add(css.tile);

        // Set tile content and colour scheme
        this.content = content;
        this.foreground = foreground;
        this.background = background;

        // Set the tile size
        this.tileWidth = (tileSize?.tileWidth) ? tileSize.tileWidth : `1rem`;
        this.tileHeight = (tileSize?.tileHeight) ? tileSize.tileHeight : this.tileWidth;

        // Set the tile position
        this.position = position;
    };

    /** Get or set the tile contents */
    get content(): string | HTMLElement {
        return this._content;
    }

    set content(newContent: string | HTMLElement) {
        // Create contentElement if it doesn't already exist
        if (!this.contentElement) {
            this.contentElement = document.createElement('div');
            this.element.appendChild(this.contentElement);
        }
        // Only update if the new and old content don't match
        if (this._content !== newContent) {
            // If content is a string, just add it
            if (typeof newContent === 'string') {
                this.contentElement.innerHTML = newContent;
            }
            // If it is an element, empty the tile and append the new content
            else {
                while(this.contentElement.lastElementChild) {
                    this.contentElement.removeChild(this.contentElement.lastElementChild);
                }
                this.contentElement.appendChild(newContent);
            }
        }
    }

    /** Get or set the background colour */
    get background(): string {
        return this._background;
    }
    
    set background(newBackground: string) {
        if (newBackground !== this._background) {
            this._background = newBackground;
            this.element.style.backgroundColor = newBackground;
        }
    }

    /** Get or set the foreground colour */
    get foreground(): string {
        return this._foreground;
    }

    set foreground(newForeground: string) {
        if (newForeground !== this._foreground) {
            this._foreground = newForeground;
            this.element.style.color = newForeground;
        }
    }

    /** Get or set position */
    get position(): Position {
        return this._position;
    }

    set position(position: Position) {
        this._position = {...position};
        this.element.style.left = `calc(${position.x} * ${this.tileWidth})`;
        this.element.style.top = `calc(${position.y} * ${this.tileHeight})`;
    }

    /** Get or set tile width */
    get tileWidth():string {
        return this._tileWidth;
    }

    set tileWidth(newWidth: string) {
        this._tileWidth = newWidth;
        this.element.style.width = newWidth;
    }

    /** Get or set the tile height */
    get tileHeight():string {
        return this._tileHeight;
    }

    set tileHeight(newHeight: string) {
        this._tileHeight = newHeight;
        this.element.style.height = newHeight;
    }
}

/** Display class, to create and control a display */
class Display {
    private _width: number;
    private _height: number;
    private target: HTMLDivElement;
    readonly element: HTMLDivElement;
    private tiles: Array<Tile>;
    private background: string;
    private foreground: string;

    private tileSize: TileSize;

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
        this.element.style.background = this.background;
        this.foreground = (foreground) ? foreground : '#ffffff';
        this.element.style.color = this.foreground;
        this.element.style.fontSize = (tileHeight) ? tileHeight : '1rem';

        // Set the display dimensions
        this.tileSize = {
            tileWidth: (tileWidth) ? tileWidth : '1rem',
            tileHeight: (tileHeight) ? tileHeight : (tileWidth) ? tileWidth : '1rem'
        };
        this.dimensions = {width, height};

        // Attach display to the target element
        this.target.appendChild(this.element);
    };

    /** Get or set the display dimensions */
    get dimensions(): Dimension {
        return {width: this._width, height:this._height};
    };

    set dimensions(newDimensions: Dimension) {
        if (newDimensions.width !== this._width && newDimensions.height !== this._height) {
            this._width = newDimensions.width;
            this._height = newDimensions.height;

            this.element.style.width = `calc(${this._width} * ${this.tileSize.tileWidth})`;
            this.element.style.height = `calc(${this._height} * ${this.tileSize.tileHeight})`;
            // Reset the display to accomodate the new size
            this.allocateDisplay();
        }
    };

    /** Build the array of tiles and attach them to the display */
    allocateDisplay() {
        // Start a fresh tiles array
        this.tiles = [];

        // Generate tiles
        const length = this._height * this._width;
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