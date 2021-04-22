import {Provider} from "../provider";
import {TrackerData} from "../models/TrackerData";
import {ProductTracker} from "../models/ProductTracker";
import * as uuid from "uuid";
import {TrackingFrequency} from "../models/enums/TrackingFrequency";
import {CurrencyType} from "../models/enums/CurrencyType";
import {calculatePriceDifferencePercentage, parsePrettyPrice} from "../utils";
import {TrackerConfig} from "../models/TrackerConfig";

export class TrackerController{

    provider: Provider;

    constructor(provider: Provider){
        this.provider = provider;
    }

    public trackerUpdate = async (req, res) => {
        //TODO :: Proper API auth
        this.provider.TrackerUpdateService.updateAllTrackers().then(r => {});
        res.status(200).send();
    }

    public trackerTest = async (req, res) => {
        if(req.body.url){
            let url = req.body.url
            let trackerData = await this.provider.ScrapingService.getTrackerData(url);
            if(!this.provider.ScrapingService.checkTrackerDataIsValid(trackerData)){
                this.provider.ConfirmedWebsiteRepo.insertNewConfirmedWebsiteEntry(new URL(url).hostname, false);
                res.status(400).send();
                return;
            }
            this.provider.ConfirmedWebsiteRepo.insertNewConfirmedWebsiteEntry(new URL(url).hostname, true);
            res.status(200).json(trackerData);
            return;
        }
    }

    public trackerHostnameConfirmed = async (req, res) => {
        if(req.body.url){
            let url = req.body.url;
            try
            {
                let confirmedEntry = await this.provider.ConfirmedWebsiteRepo.getByHostname(new URL(url).hostname);
                if(confirmedEntry && confirmedEntry.length > 0){
                    let entry = confirmedEntry[0];
                    res.status(200).json(entry.working);
                    return;
                }
            }
            catch (err) {
                res.status(200).json(false);
                return;
            }

            res.status(200).json(false);
            return;
        }
    }

    public trackerAdd = async (req, res) => {
        if(req.body.url && req.body.owner){
            let url = req.body.url
            let owner = req.body.owner

            let trackerData: TrackerData = await this.provider.ScrapingService.getTrackerData(url);

            if(!this.provider.ScrapingService.checkTrackerDataIsValid(trackerData)){
                res.status(400).json;
            }

            let newTracker: ProductTracker = {
                id: uuid.v4(),
                owner: owner,
                url: url,
                title: trackerData.title,
                priceData: {
                    currentPrice: trackerData.currentPrice,
                    currentPricePretty: trackerData.currentPricePretty,
                    initialPrice: trackerData.currentPrice,
                    initialPricePretty: trackerData.currentPricePretty,
                    priceDifference: 0
                },
                dateStartedTracking: Date.now(),
                imageUrl: trackerData.largestImageSrc,
                trackingFrequency: TrackingFrequency.Daily,
                currencyType: CurrencyType[trackerData.currencyType],
                isAvailable: trackerData.isAvailable,
                datapoints: await this.provider.TrackerDatapointRepo.getAllDatapointsForUrl(url)
            }

            try {
                await this.provider.ProductTrackerRepo.insertNewTracker(newTracker);
                res.status(200).json(newTracker);
            } catch(err){
                res.status(400).json(err);
            }
        }
    }

    public trackerConfigUpdate = async (req, res) => {
        if(req.body.id && req.body.config){
            let trackerConfig: TrackerConfig = req.body.config;
            try{
                await this.provider.ProductTrackerRepo.updateExistingTrackerConfig(req.body.id, trackerConfig);
                let updatedTracker = await this.provider.ProductTrackerRepo.getTrackersById(req.body.id);
                updatedTracker.priceData.initialPricePretty = parsePrettyPrice(updatedTracker.priceData.initialPrice, CurrencyType[updatedTracker.currencyType]);
                updatedTracker.priceData.currentPricePretty = parsePrettyPrice(updatedTracker.priceData.currentPrice, CurrencyType[updatedTracker.currencyType]);
                updatedTracker.priceData.priceDifference = calculatePriceDifferencePercentage(updatedTracker.priceData.initialPrice, updatedTracker.priceData.currentPrice);
                updatedTracker.datapoints = await this.provider.TrackerDatapointRepo.getAllDatapointsForUrl(updatedTracker.url);
                res.status(200).json(updatedTracker);
            } catch(err){
                res.status(400).json(err);
            }
        }
    }

    public trackerByUserId = async (req, res) => {
        // let token = req.headers['authorization'].split(" ")[1];
        // let decoded = jwt_decode(<string>token);
        // let jwtEmail = decoded["https://producttracker-api/email"];

        if(req.params.userId){
            let userData = await this.provider.UserService.getUserById(req.params.userId);
            if(!userData){
                res.status(400).send("No user found with that Id.");
                return;
            }

            // if(userData.email != jwtEmail){
            //     res.status(401).send("Unauthorised access.");
            //     return;
            // }

            let trackers: ProductTracker[] = await this.provider.ProductTrackerRepo.getTrackersByUserId(req.params.userId);
            for (const tracker of trackers) {
                tracker.priceData.initialPricePretty = parsePrettyPrice(tracker.priceData.initialPrice, CurrencyType[tracker.currencyType]);
                tracker.priceData.currentPricePretty = parsePrettyPrice(tracker.priceData.currentPrice, CurrencyType[tracker.currencyType]);
                tracker.priceData.priceDifference = calculatePriceDifferencePercentage(tracker.priceData.initialPrice, tracker.priceData.currentPrice);
                tracker.datapoints = await this.provider.TrackerDatapointRepo.getAllDatapointsForUrl(tracker.url);
            }
            trackers = trackers.sort((a, b) => {
                return a.dateStartedTracking - b.dateStartedTracking
            })
            if(trackers){
                if(trackers.length === 0){
                    res.status(201).send();
                    return;
                }
                res.status(200).json(trackers);
                return;
            } else {
                res.status(400).send();
                return;
            }
        }
    }

    public trackerDelete = async (req, res) => {
        if(req.params.trackerId){
            try {
                await this.provider.ProductTrackerRepo.deleteTrackerById(req.params.trackerId);
                res.status(200).json();
            } catch(err){
                res.status(400).send();
            }
        }
    }
}




