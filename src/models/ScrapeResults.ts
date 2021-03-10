import {PageElementRecord} from "./PageElementRecord";

export interface ScrapeResults {
    title: string;
    allPageElementRecords: PageElementRecord[];
    couldBePriceRecords: PageElementRecord[];
    couldBeImageRecords: PageElementRecord[];
    couldBeAvailabilityRecords: PageElementRecord[];
    couldBeCurrencyRecords: PageElementRecord[];
}
