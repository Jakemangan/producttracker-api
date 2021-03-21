import {ProductTrackerRepo} from "../repos/ProductTrackerRepo";
import {ProductTracker} from "../models/ProductTracker";
import {WebsiteScraper} from "./WebsiteScraper";
import {ScrapingService} from "./ScrapingService";
import {TrackerData} from "../models/TrackerData";
import {TrackerDatapoint} from "../models/TrackerDatapoint";
import {TrackerDatapointRepo} from "../repos/TrackerDatapointRepo";

export class TrackerUpdateService {
    private productTrackerRepo: ProductTrackerRepo;
    private trackerDatapointRepo: TrackerDatapointRepo;
    private scrapingService: ScrapingService;

    constructor(productTrackerRepo: ProductTrackerRepo,
                scrapingService: ScrapingService,
                trackerDatapointRepo: TrackerDatapointRepo) {
        this.productTrackerRepo = productTrackerRepo;
        this.scrapingService = scrapingService;
        this.trackerDatapointRepo = trackerDatapointRepo;
    }

    public async updateAllTrackers() {
        const allTrackers: ProductTracker[] = await this.productTrackerRepo.getAllTrackers();
        const urlsToUpdate: string[] = [];
        allTrackers.forEach(tracker => urlsToUpdate.push(tracker.url));
        let uniqueUrlsToUpdate = [...new Set(urlsToUpdate)]

        for (const url of uniqueUrlsToUpdate) {
            let newTrackerData: TrackerData = await this.scrapingService.getTrackerData(url);
            await this.updateTrackerByUrl(url, newTrackerData)
            await this.addTrackerDatapoint(url, newTrackerData);
        }
    }

    private async updateTrackerByUrl(url: string, newTrackerData: TrackerData){
        await this.productTrackerRepo.updateExistingTrackerByUrl(url, newTrackerData);
    }

    private async addTrackerDatapoint(url: string, newTrackerData: TrackerData){
        let toInsert: TrackerDatapoint = {
            url: url,
            price: newTrackerData.currentPrice,
            date: Date.now()
        }
        await this.trackerDatapointRepo.insertNewDatapoint(toInsert);
    }
}
