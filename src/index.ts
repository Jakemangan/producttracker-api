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
import {calculatePriceDifferencePercentage, parsePrettyPrice} from "./utils";
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
import { ConfirmedWebsiteRepo } from "./repos/ConfirmedWebsitesRepo";
import {Provider} from "./provider";
import {TrackerController} from "./controllers/tracker.controller";
import {TrackerDatapointController} from "./controllers/tracker-datapoint.controller";
import {AuthController} from "./controllers/auth.controller";

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
    origin: ['http://localhost:4200/', "https://producttracker-api.herokuapp.com"],
    preflightContinue: false,
};

dotenv.config();
const app = express();
app.use(bodyParser.json())
app.use(cors());

const provider = new Provider();
const trackerController = new TrackerController(provider);
const trackerDatapointController = new TrackerDatapointController(provider);
const authController = new AuthController(provider);

/*
* END SERVER CONFIG
 */

/*
* START ROUTES
 */

//Tracker routes
app.post('/tracker/update/all', trackerController.trackerUpdate);
app.post('/tracker/test', trackerController.trackerTest) //TODO :: Temp
app.post('/tracker/hostname/confirmed', trackerController.trackerHostnameConfirmed);
app.post('/tracker/add', trackerController.trackerAdd);
app.get('/tracker/:userId', trackerController.trackerByUserId)
app.put('/tracker/config', trackerController.trackerConfigUpdate);
app.delete('/tracker/:trackerId', trackerController.trackerDelete)

//Tracker datapoint routes
app.get("/datapoints/:url", trackerDatapointController.getTrackerDatapointsByUrl);

//Auth routes
app.get("/user/whoami/:email", authController.getUserDataByEmail)

/*
* END ROUTES
 */



app.listen(process.env.PORT, () => {
    return console.log(`server is listening on ${process.env.PORT}`);
});



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


















