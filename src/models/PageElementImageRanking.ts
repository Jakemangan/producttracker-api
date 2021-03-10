import {PageElementRecord} from "./PageElementRecord";
import {ElementPriceRankingMap} from "./PageElementPriceRanking";

export interface PageElementImageRanking {
    totalScore: number;
    rankingsMap: ElementImageRankingMap;
    elementData: PageElementRecord
}

export interface ElementImageRankingMap {
    yPosition: number;
    largestImage: number;
}
