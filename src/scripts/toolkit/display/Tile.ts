import css from './Display.module.scss';
import { TileSize, Position, TileOptions } from './DisplayInterfaces';

/** Class to keep track of each individual tile in the display */
export class Tile {
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
    private _tileHeight: number;
    private _tileWidth: number;

    private _className: string;

    /** Element this tile corresponds to in the DOM */
    readonly element: HTMLDivElement;

    constructor(
        tileOptions: TileOptions,
        position: Position,
        tileSize?: TileSize,
    ) {
        // Create necessary elements and apply classes
        this.element = document.createElement('div');
        this.element.classList.add(css.tile);

        // Set tile content and colour scheme
        const { content='', foreground='#ffffff', background='#000000' } = tileOptions;
        this.content = content;
        this.foreground = foreground;
        this.background = background;

        // Set the tile size
        this.tileWidth = (tileSize?.tileWidth) ? tileSize.tileWidth : 16;
        this.tileHeight = (tileSize?.tileHeight) ? tileSize.tileHeight : this.tileWidth;

        // Set the tile position
        this.position = position;

        this.className = "";
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
            this._content = newContent;
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
        this.element.style.left = `${position.x * this.tileWidth}px`;
        this.element.style.top = `${position.y * this.tileHeight}px`;
    }

    /** Get or set tile width */
    get tileWidth():number {
        return this._tileWidth;
    }

    set tileWidth(newWidth: number) {
        this._tileWidth = newWidth;
        this.element.style.width = `${newWidth}px`;
    }

    /** Get or set the tile height */
    get tileHeight():number {
        return this._tileHeight;
    }

    set tileHeight(newHeight: number) {
        this._tileHeight = newHeight;
        this.element.style.height = `${newHeight}px`;
    }

    /** Get or set the classname */
    get className():string {
        return this._className;
    }

    set className(newClass:string) {
        if (this._className && newClass !== this._className && this.element.classList.contains(this._className)) {
            this.element.classList.remove(this._className);
        }
        this._className=newClass;
        if (newClass) {
            this.element.classList.add(newClass);
        }
    }

    /** Set options for the tile */
    setOptions(newOptions: TileOptions) {
        const {content, background,foreground,className } = newOptions;
        if (content) {
            this.content = content;
        }
        if (background) {
            this.background = background;
        }
        if (foreground) {
            this.foreground = foreground;
        }
        if (typeof className === "string") {
            this.className = className;
        }
    }
}