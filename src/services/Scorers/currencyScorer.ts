import {PageElementRecord} from "../../models/PageElementRecord";
import {CurrencyType} from "../../models/enums/CurrencyType";

/*
* TODO :: Expand this to be able to detect EUR, USD, AUD, GBP, etc etc, not just $ and £
 */
export class CurrencyScorer{
    gbpTally: number;
    dollarTally: number;

    constructor() {
        this.gbpTally = 0;
        this.dollarTally = 0;
    }

    run(records: PageElementRecord[]){
        records.forEach(record => {
            if(record.textContent.includes("£")){
                this.gbpTally++;
                return;
            }
            if(record.textContent.includes("$")){
                this.dollarTally++;
                return;
            }
        });

        if(this.gbpTally > this.dollarTally){
            return CurrencyType.GBP;
        } else {
            return CurrencyType.USD;
        }
    }
}
