/** Display parameters */
interface DisplayParams {
    target: HTMLDivElement;
    width: number;
    height: number;
    tileWidth?: number;
    tileHeight?: number;
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

/** Display class, to create and control a display */
class Display {



    constructor(
        parameters: DisplayParams
    ) {

    }
};

export default Display;