import {CurrencyType} from "./models/enums/CurrencyType";

export function parsePrettyPrice(input: number, currencyType: CurrencyType): string{
    let currencyTypeAsSymbol;
    switch(parseInt(currencyType.toString())){
        case CurrencyType.GBP:
            currencyTypeAsSymbol = "£";
            break;
        case CurrencyType.USD:
            currencyTypeAsSymbol = "$"
            break;
        default:
            currencyTypeAsSymbol = "";
            break;
    }
    let lengthOfPriceString = input.toString().length;
    let priceAsString = input.toString();
    let decimalSlice = priceAsString.slice(lengthOfPriceString-2, lengthOfPriceString);
    return currencyTypeAsSymbol + priceAsString.slice(0, lengthOfPriceString-2) + "." + decimalSlice;
}
