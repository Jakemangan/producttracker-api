import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import {ProductTracker} from "./models/ProductTracker";
import * as uuid from "uuid"
import {TrackingFrequency} from "./models/enums/TrackingFrequency";
import {ProductTrackerRepo} from "./repos/ProductTrackerRepo";
import {PoolHandler} from "./repos/PoolHandler";
import {CurrencyType} from "./models/enums/CurrencyType";
import {ScrapingService} from "./services/ScrapingService";
import {parsePrettyPrice} from "./utils";
import {TrackerDatapointRepo} from "./repos/TrackerDatapointRepo";
import {TrackerUpdateService} from "./services/TrackerUpdateService";
import {TrackerData} from "./models/TrackerData";
import {TrackerDatapoint} from "./models/TrackerDatapoint";
import jwt from "express-jwt";
import * as jwtAuthz from "express-jwt-authz";
import * as jwksRsa from "jwks-rsa";
import jwt_decode from "jwt-decode";
import { UserRepo } from "./repos/UserRepo";
import { UserService } from "./services/UserService";

// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.tesco.com/groceries/en-GB/products/254896546?preservedReferrer=https://www.tesco.com/";
// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.amazon.co.uk/gp/product/B07VDBFBV9?pf_rd_r=CHVJMV78BRXMM5A3ZMTF&pf_rd_p=6e878984-68d5-4fd2-b7b3-7bc79d9c8b60&pd_rd_r=2989b131-9b9e-4ce1-ad09-9d27593b5c98&pd_rd_w=nSoQe&pd_rd_wg=7HJ3w&ref_=pd_gw_unk";
// let url = "https://www.jacksonsart.com/holbein-duo-aqua-watermixable-oil-paint-elite-colours";
// let url = "https://www.newegg.com/msi-geforce-rtx-3080-rtx-3080-gaming-x-trio-10g/p/N82E16814137597?Description=rtx%203080&cm_re=rtx_3080-_-14-137-597-_-Product&quicklink=true";

/*
* TODO :: Fix "UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'attributes' of undefined"
* TODO :: Above is triggered by https://www.coindesk.com/price/bitcoin
*
* TODO :: UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'elementData' of undefined at PriceScorer.run
* TODO :: Above is triggered by https://www.autotrader.co.uk/car-details/202011126048680?model=S90&postcode=ls176we&advertising-location=at_cars&radius=1501&sort=relevance&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&make=VOLVO&include-delivery-option=on&page=1
 */

const options: cors.CorsOptions = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'X-Access-Token',
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: 'http://localhost:4200/',
    preflightContinue: false,
};

dotenv.config();
const app = express();
app.use(bodyParser.json())
app.use(cors());

const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://dev-x1v77dqr.eu.auth0.com/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: 'https://producttracker-api/',
    issuer: `https://dev-x1v77dqr.eu.auth0.com/`,
    algorithms: ['RS256']
});

/*
* END SERVER CONFIG
 */





//TODO :: Create provider 
let poolHandler = new PoolHandler();
let productTrackerRepo = new ProductTrackerRepo(poolHandler);
let trackerDatapointRepo = new TrackerDatapointRepo(poolHandler);
let userRepo = new UserRepo(poolHandler);

let scrapingService = new ScrapingService();
let trackerUpdateService = new TrackerUpdateService(productTrackerRepo, scrapingService, trackerDatapointRepo);

let userService = new UserService(userRepo);




// temp();
//
// async function temp(){
//     let url = "https://www.amazon.co.uk/Palit-GamingPro-Ray-Tracing-Graphics-DisplayPort/dp/B08LDS72P2/ref=sr_1_1?dchild=1&keywords=gpu&qid=1615415153&refinements=p_n_availability%3A419162031&rnid=419160031&sr=8-1";
//     let scrapeResult: ScrapeResults = await scraper.launch(url);
//     console.log(scrapeResult);
//     let largestImageSrc = imageScorer.run(scrapeResult.couldBeImageRecords);
//     let isAvailable = !(scrapeResult.couldBeAvailabilityRecords.length > 0);
//     let currencyTypeResult = currencyScorer.run(scrapeResult.couldBeCurrencyRecords);
//     console.log("Src: ", largestImageSrc);
//     console.log("Is available: ", isAvailable);
//     console.log("Currency type: ", CurrencyType[currencyTypeResult])
// }

app.post('/tracker/update/all', async (req, res) => {
    //TODO :: Proper API auth
    trackerUpdateService.updateAllTrackers().then(r => {});
    res.status(200).send();
})

//TODO :: Temp
app.post('/tracker/test', async (req, res) => {
    if(req.body){
        let url = req.body.url
        let trackerData = await scrapingService.getTrackerData(url);
        res.status(200).json(trackerData);
    }
})

app.post('/tracker/add', async (req, res) => {
    if(req.body){
        let url = req.body.url
        let owner = req.body.owner

        let trackerData: TrackerData = await scrapingService.getTrackerData(url);

        let newTracker: ProductTracker = {
            id: uuid.v4(),
            owner: owner,
            url: url,
            title: trackerData.title,
            initialPrice: trackerData.currentPrice,
            initialPricePretty: trackerData.currentPricePretty,
            currentPrice: trackerData.currentPrice,
            currentPricePretty: trackerData.currentPricePretty,
            dateStartedTracking: Date.now(),
            imageUrl: trackerData.largestImageSrc,
            trackingFrequency: TrackingFrequency.Daily,
            currencyType: CurrencyType[trackerData.currencyType],
            isAvailable: trackerData.isAvailable,
            datapoints: await trackerDatapointRepo.getAllDatapointsForUrl(url)
        }

        try {
            await productTrackerRepo.insertNewTracker(newTracker);
            res.status(200).json(newTracker);
        } catch(err){
            res.status(400).json(err);
        }
    }
})

app.get('/tracker/:userId', checkJwt, async (req, res) => {
    let token = req.headers['authorization'].split(" ")[1];
    let decoded = jwt_decode(<string>token);
    let jwtEmail = decoded["https://producttracker-api/email"];

    if(req.params.userId){
        let userData = await userService.getUserById(req.params.userId);
        if(!userData){
            res.status(400).send("No user found with that Id.");
            return;
        }

        if(userData.email != jwtEmail){
            res.status(401).send("Unauthorised access.");
            return;
        }

        let trackers: ProductTracker[] = await productTrackerRepo.getTrackersByUserId(req.params.userId);
        for (const tracker of trackers) {
            tracker.initialPricePretty = parsePrettyPrice(tracker.initialPrice, CurrencyType[tracker.currencyType]);
            tracker.currentPricePretty = parsePrettyPrice(tracker.initialPrice, CurrencyType[tracker.currencyType]);
            tracker.datapoints = await trackerDatapointRepo.getAllDatapointsForUrl(tracker.url);
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
})

app.delete('/tracker/:trackerId', async (req, res) => {
    if(req.params.trackerId){
        try {
            await productTrackerRepo.deleteTrackerById(req.params.trackerId);
            res.status(200).json();
        } catch(err){
            res.status(400).send();
        }
    }
})

app.get("/datapoints/:url", async (req, res) => {
    if(req.params.url){
        try{
            let datapoints: TrackerDatapoint[] = await trackerDatapointRepo.getAllDatapointsForUrl(req.params.url);
            if(datapoints.length > 0){
                res.status(200).json(datapoints);
            }
            res.status(201).send();
        }
        catch(err){
            res.status(400).send();
        }
    }
})

app.get("/user/whoami/:email", checkJwt, async(req,res) => {
    let token = req.headers['authorization'].split(" ")[1];
    let decoded = jwt_decode(<string>token);
    let jwtEmail = decoded["https://producttracker-api/email"];

    if(!req.params.email){
        res.status(400).json("No email parameter.");
    }

    if(jwtEmail != req.params.email){
        res.status(401).send("Unauthorised access.");
    }

    let userData = await userService.getOrInitUser(jwtEmail);
    if(userData){
        res.status(200).json(userData);
    } else {
        res.status(400).json("Bad request");
    }
})

app.listen(process.env.PORT, () => {
    return console.log(`server is listening on ${process.env.PORT}`);
});


