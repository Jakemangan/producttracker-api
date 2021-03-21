import {CurrencyType} from "./enums/CurrencyType";

export interface TrackerData{
    title: string;
    currentPrice: number;
    currentPricePretty: string;
    largestImageSrc: string;
    isAvailable: boolean;
    currencyType: CurrencyType;
}
