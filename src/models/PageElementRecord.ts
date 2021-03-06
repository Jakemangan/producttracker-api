export interface PageElementRecord {
    bboxJson: string;
    fontSize: string;
    textDecoration: string;
    color: string;
    className: string;
    textContent: string;
    tag: string;
    id: string;
}

export interface ElementBoundingBox {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
    x: number;
    y: number;
}
