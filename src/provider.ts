import {PoolHandler} from "./repos/PoolHandler";
import {ProductTrackerRepo} from "./repos/ProductTrackerRepo";
import {TrackerDatapointRepo} from "./repos/TrackerDatapointRepo";
import {UserRepo} from "./repos/UserRepo";
import {ConfirmedWebsiteRepo} from "./repos/ConfirmedWebsitesRepo";
import {ScrapingService} from "./services/ScrapingService";
import {TrackerUpdateService} from "./services/TrackerUpdateService";
import {UserService} from "./services/UserService";

export class Provider {
    /*
    * Repos
     */
    poolHandler: PoolHandler;
    productTrackerRepo: ProductTrackerRepo;
    trackerDatapointRepo: TrackerDatapointRepo;
    userRepo: UserRepo;
    confirmedWebsiteRepo: ConfirmedWebsiteRepo;

    /*
    * Services
     */
    scrapingService: ScrapingService;
    trackerUpdateService: TrackerUpdateService;
    userService: UserService;
    
    constructor(){
        this.poolHandler = new PoolHandler();
        this.productTrackerRepo = new ProductTrackerRepo(this.poolHandler);
        this.trackerDatapointRepo = new TrackerDatapointRepo(this.poolHandler);
        this.userRepo = new UserRepo(this.poolHandler);
        this.confirmedWebsiteRepo = new ConfirmedWebsiteRepo(this.poolHandler);

        this.scrapingService = new ScrapingService();
        this.trackerUpdateService = new TrackerUpdateService(this.productTrackerRepo, this.scrapingService, this.trackerDatapointRepo);

        this.userService = new UserService(this.userRepo);
    }

    get ProductTrackerRepo(): ProductTrackerRepo {
        return this.productTrackerRepo;
    }

    get TrackerDatapointRepo(): TrackerDatapointRepo{
        return this.trackerDatapointRepo;
    }

    get UserRepo(): UserRepo{
        return this.userRepo;
    }

    get ConfirmedWebsiteRepo(): ConfirmedWebsiteRepo{
        return this.confirmedWebsiteRepo;
    }

    get ScrapingService(): ScrapingService{
        return this.scrapingService;
    }

    get TrackerUpdateService(): TrackerUpdateService{
        return this.trackerUpdateService;
    }

    get UserService(): UserService{
        return this.userService;
    }
}
