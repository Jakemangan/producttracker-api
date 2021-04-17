import {Provider} from "../provider";
import {TrackerData} from "../models/TrackerData";
import {ProductTracker} from "../models/ProductTracker";
import * as uuid from "uuid";
import {TrackingFrequency} from "../models/enums/TrackingFrequency";
import {CurrencyType} from "../models/enums/CurrencyType";
import {calculatePriceDifferencePercentage, parsePrettyPrice} from "../utils";
import {TrackerDatapoint} from "../models/TrackerDatapoint";

export class TrackerDatapointController{

    provider: Provider;

    constructor(provider: Provider){
        this.provider = provider;
    }

    getTrackerDatapointsByUrl = async (req, res) => {
        if(req.params.url){
            try{
                let datapoints: TrackerDatapoint[] = await this.provider.TrackerDatapointRepo.getAllDatapointsForUrl(req.params.url);
                if(datapoints.length > 0){
                    res.status(200).json(datapoints);
                }
                res.status(201).send();
            }
            catch(err){
                res.status(400).send();
            }
        }
    }
}




