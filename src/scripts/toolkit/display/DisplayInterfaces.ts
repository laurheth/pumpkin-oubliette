/** Display parameters */
export interface DisplayParams {
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
export interface Dimension {
    /** Number of tiles wide. */
    width: number;
    /** Number of tiles high. */
    height: number;
};

/** Tilesize interface */
export interface TileSize {
    /** Width of a tile. */
    tileWidth: string;
    /** Height of a tile */
    tileHeight: string;
}

/** Tile options interface */
export interface TileOptions {
    content?: string|HTMLElement;
    background?: string;
    foreground?: string;
}

/** Position interface */
export interface Position {
    x: number,
    y: number
}