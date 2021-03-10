import {PageElementRecord} from "./PageElementRecord";

export interface PageElementPriceRanking {
    totalScore: number;
    rankingMap: ElementPriceRankingMap;
    elementData: PageElementRecord
}

export interface ElementPriceRankingMap {
    yPosition: number;
    largestFontSize: number;
    presenceOfCurrency: number;
    textContentLength: number;
    priceInClassname: number;
    noStrikethrough: number;
    emptyBasket: number;
    presenceOfDigits: number;
}
