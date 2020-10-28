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

export interface MapParams {
    generator?: generator;
    source?: object;
    level?: number;
    theme?: theme;
    width?: number;
    height?: number;
}