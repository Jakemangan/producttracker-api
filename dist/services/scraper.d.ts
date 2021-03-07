import { PageElementRecord } from "../models/PageElementRecord";
export declare class Scraper {
    constructor();
    launch(url: string): Promise<PageElementRecord[]>;
}
