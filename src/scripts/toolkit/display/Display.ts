import css from './Display.css';

/** Display parameters */
interface DisplayParams {
    /** Target div to use as the display. */
    target: HTMLDivElement;
    /** Width in tiles of the display. */
    width: number;
    /** Height in tiles of the display. */
    height: number;
    /** Optional width of each tile. */
    tileWidth?: number;
    /** Optional height of each tile. */
    tileHeight?: number;
    /** Default background colour of the display */
    background?: string;
    /** Default foreground colour of the display */
    foreground?: string;
}

/** Class to keep track of each individual tile in the display */
class Tile {
    /** Contents of the tile  */
    private _content: string | HTMLElement;
    /** Background colour. */
    private _background: string;
    /** Foreground colour */
    private _foreground: string;

    /** Element this tile corresponds to in the DOM */
    readonly element: HTMLDivElement;

    constructor(
        content: string | HTMLElement,
        background: string,
        foreground: string,
    ) {
        this.element = document.createElement('div');
        this.content = content;
        this.foreground = foreground;
        this.background = background;
    };

    /** Get or set the tile contents */
    get content(): string | HTMLElement {
        return this._content;
    }

    set content(newContent: string | HTMLElement) {
        // Only update if the new and old content don't match
        if (this._content !== newContent) {
            // If content is a string, just add it
            if (typeof newContent === 'string') {
                this.element.innerHTML = newContent;
            }
            // If it is an element, empty the tile and append the new content
            else {
                while(this.element.lastElementChild) {
                    this.element.removeChild(this.element.lastElementChild);
                }
                this.element.appendChild(newContent);
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
}

/** dimensions interface */
interface Dimension {
    width: number;
    height: number;
};

/** Display class, to create and control a display */
class Display {
    private _width: number;
    private _height: number;
    private target: HTMLDivElement;
    readonly element: HTMLDivElement;
    private tiles: Array<Tile>;
    private background: string;
    private foreground: string;

    /** Create a new Display
     *  @param {DisplayParams} parameters - Object of parameters to initialize the display.
     */
    constructor(
        parameters: DisplayParams
    ) {
        const {target, width, height, background, foreground, ...rest} = parameters;
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

        // Set the display dimensions
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
        for (let i=0;i<length;i++) {
            // Make a new tile
            const newTile = new Tile('',this.background,this.foreground);
            // Add it to the list of tiles
            this.tiles.push(newTile);
            // Append to the actual display
            this.element.appendChild(newTile.element);
        }
    };

};

export default Display;