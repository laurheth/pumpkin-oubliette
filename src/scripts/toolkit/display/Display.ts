// Display parameters
interface DisplayParams {
    target: HTMLDivElement;
    width: number;
    height: number;
    tileWidth?: number;
    tileHeight?: number;
}

// Class to keep track of each individual tile in the display
class Tile {
    // Contents of the tile
    private _content: string | HTMLElement;
    // Background colour.
    private _background: string;
    // Foreground colour
    private _foreground: string;

    // Element this tile corresponds to in the DOM
    readonly element: HTMLDivElement;

    constructor(
        content: string | HTMLElement,
        background: string,
        foreground: string,
    ) {
        this.element = document.createElement('div');
        this.content = content;
    };

    // Getter and setter for content
    get content(): string | HTMLElement {
        return this._content;
    }

    set content(newContent: string | HTMLElement) {
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

    // Getters and setters for color
    get background(): string {
        return this._background;
    }

    get foreground(): string {
        return this._foreground;
    }

    set background(newBackground: string) {
        this._background = newBackground;
        this.element.style.backgroundColor = newBackground;
    }

    set foreground(newForeground: string) {
        this._foreground = newForeground;
        this.element.style.color = newForeground;
    }
}

// Display class
class Display {



    constructor(
        parameters: DisplayParams
    ) {

    }
};

export default Display;