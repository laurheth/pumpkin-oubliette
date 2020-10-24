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
    width: number;
    height: number;
};

/** Tilesize interface */
export interface TileSize {
    tileWidth: string;
    tileHeight: string;
}

/** Position interface */
export interface Position {
    x: number,
    y: number
}