/** Display parameters */
export interface DisplayParams {
    /** Target div to use as the display. */
    target: HTMLDivElement;
    /** Width in tiles of the display. */
    width?: number;
    /** Height in tiles of the display. */
    height?: number;
    /** Optional width of each tile in pixels. */
    tileWidth?: number;
    /** Optional height of each tile in pixels. */
    tileHeight?: number;
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
    /** Width of a tile in pixels. */
    tileWidth: number;
    /** Height of a tile in pixels. */
    tileHeight: number;
}

/** Tile options interface */
export interface TileOptions {
    content?: string|HTMLElement;
    background?: string;
    foreground?: string;
}

/** Position on the display */
export interface Position {
    /** Position relative to the left of the display. */
    x: number,
    /** Position relative to the top of the display */
    y: number
}