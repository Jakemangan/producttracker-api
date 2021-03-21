import {WebsiteScraper} from "./WebsiteScraper";
import {PriceScorer} from "./Scorers/priceScorer";
import {ImageScorer} from "./Scorers/imageScorer";
import {CurrencyScorer} from "./Scorers/currencyScorer";
import {TrackerData} from "../models/TrackerData";
import {ScrapeResults} from "../models/ScrapeResults";
import {CurrencyType} from "../models/enums/CurrencyType";
import { parsePrettyPrice } from "../utils";

export class ScrapingService{
    private scraper: WebsiteScraper;
    private priceScorer: PriceScorer;
    private currencyScorer: CurrencyScorer;
    private imageScorer: ImageScorer;

    constructor(){
        this.scraper = new WebsiteScraper();
        this.priceScorer = new PriceScorer();
        this.currencyScorer = new CurrencyScorer()
        this.imageScorer = new ImageScorer();
    }

    public async getTrackerData(url: string): Promise<TrackerData> {
        let scrapeResult: ScrapeResults = await this.scraper.launch(url);
        let price = this.priceScorer.run(scrapeResult.couldBePriceRecords);
        let largestImageSrc = this.imageScorer.run(scrapeResult.couldBeImageRecords);
        let isAvailable = !(scrapeResult.couldBeAvailabilityRecords.length > 0);
        let currencyTypeResult = this.currencyScorer.run(scrapeResult.couldBeCurrencyRecords);
        let currentPricePretty = parsePrettyPrice(price, currencyTypeResult)

        return {
            title: scrapeResult.title,
            currentPrice: price,
            currentPricePretty: currentPricePretty,
            currencyType: currencyTypeResult,
            isAvailable: isAvailable,
            largestImageSrc: largestImageSrc
        }
    }
}
