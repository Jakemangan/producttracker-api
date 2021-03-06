import {PageElementRecord} from "./PageElementRecord";

export interface PageElementRanking {
    totalScore: number;
    rankingsMap: ElementRankingMap;
    elementData: PageElementRecord
}

export interface ElementRankingMap {
    yPosition: number;
    largestFontSize: number;
    presenceOfCurrency: number;
    textContentLength: number;
    priceInClassname: number;
    noStrikethrough: number;
    emptyBasket: number;
    presenceOfDigits: number;
}
