import { MapNode } from './dataStructures';
export type generator = "json" | "default";
export type theme = "default";

export interface SquareParams {
    art: string;
    background?: string;
    foreground?: string;
    passable?: boolean;
    empty?:boolean;
    location?: MapNode;
    seeThrough?:boolean;
}

export interface MapTheme {
    roomBg:string;
    roomFg:string;
    roomFloor:string;
    hallBg:string;
    hallFg:string;
    hallFloor:string;
}

export interface MapParams {
    generator?: generator;
    source?: object;
    level?: number;
    theme?: MapTheme;
    width?: number;
    height?: number;
    density?: number;
}