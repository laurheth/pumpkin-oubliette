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
    private _tileHeight: string;
    private _tileWidth: string;

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

    /** Set options for the tile */
    setOptions(newOptions: TileOptions) {
        const {content, background,foreground} = newOptions;
        if (content) {
            this.content = content;
        }
        if (background) {
            this.background = background;
        }
        if (foreground) {
            this.foreground = foreground;
        }
    }
}