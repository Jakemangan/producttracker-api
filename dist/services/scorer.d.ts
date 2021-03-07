import { PageElementRecord } from "../models/PageElementRecord";
import { PageElementRanking } from "../models/PageElementRanking";
export declare class Scorer {
    private largestFontSize;
    constructor();
    run(pageElementRecords: PageElementRecord[]): string;
    scoreElement(elementData: PageElementRecord): PageElementRanking;
    scoreBasedOnYPosition(bboxJson: string): number;
    scoreBasedOnLargestFontSize(fontsize: string): number;
    scoreBasedOnPresenceOfCurrency(textContent: string): number;
    scoreBasedOnTextContentLength(textContent: string): number;
    scoreBasedOnPriceInClassname(className: string): number;
    scoreBasedOnNoStrikethrough(textDecoration: string): number;
    scoreBasedOnEmptyBasket(textContent: string): 0 | -3;
    scoreBasedOnPresenceOfDigits(textContent: string): 1 | -5;
    getLargestFontSize(elementData: any): number;
}
