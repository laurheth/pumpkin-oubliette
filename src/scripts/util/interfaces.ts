/** Art for a square or object */
export interface Art {
    art?: string;
    foreground?: string;
    background?: string;
}

/** Coordinates on the map */
export interface Position {
    x:number;
    y:number;
}

export const weightGen = (min:number,peak:number,scale:1|2|3|4|5|6|7|8|9|10,level:number) => {
    if (level<0) {level=0;}
    if (level<min) {
        return 0;
    }
    else if (level<peak) {
        const slope = (scale-1)/(peak-min);
        return Math.round(slope * (peak - min) + 1);
    }
    else {
        return Math.round(Math.max(1,peak/2,(scale * peak / level)));
    }
}