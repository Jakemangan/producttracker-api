import {Scraper} from "./services/scraper";
import {PriceScorer} from "./services/priceScorer";
import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import {PriceResponse} from "./models/PriceResponse";
import {ScrapeResults} from "./models/ScrapeResults";
import {ProductTracker, ProductTrackerDbo} from "./models/ProductTracker";
import * as uuid from "uuid"
import {TrackingFrequency} from "./models/enums/TrackingFrequency";
import {ProductTrackerRepo} from "./repos/ProductTrackerRepo";
import {PoolHandler} from "./repos/PoolHandler";
import {ImageScorer} from "./services/imageScorer";
import {CurrencyScorer} from "./services/currencyScorer";
import {CurrencyType} from "./models/enums/CurrencyType";

// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.tesco.com/groceries/en-GB/products/254896546?preservedReferrer=https://www.tesco.com/";
// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.amazon.co.uk/gp/product/B07VDBFBV9?pf_rd_r=CHVJMV78BRXMM5A3ZMTF&pf_rd_p=6e878984-68d5-4fd2-b7b3-7bc79d9c8b60&pd_rd_r=2989b131-9b9e-4ce1-ad09-9d27593b5c98&pd_rd_w=nSoQe&pd_rd_wg=7HJ3w&ref_=pd_gw_unk";
// let url = "https://www.jacksonsart.com/holbein-duo-aqua-watermixable-oil-paint-elite-colours";
// let url = "https://www.newegg.com/msi-geforce-rtx-3080-rtx-3080-gaming-x-trio-10g/p/N82E16814137597?Description=rtx%203080&cm_re=rtx_3080-_-14-137-597-_-Product&quicklink=true";

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

let scraper = new Scraper();
let priceScorer = new PriceScorer();
let imageScorer = new ImageScorer();
let currencyScorer = new CurrencyScorer();

let poolHandler = new PoolHandler();
let trackerRepo = new ProductTrackerRepo(poolHandler);

temp();

async function temp(){
    let url = "https://www.amazon.co.uk/Palit-GamingPro-Ray-Tracing-Graphics-DisplayPort/dp/B08LDS72P2/ref=sr_1_1?dchild=1&keywords=gpu&qid=1615415153&refinements=p_n_availability%3A419162031&rnid=419160031&sr=8-1";
    let scrapeResult: ScrapeResults = await scraper.launch(url);
    console.log(scrapeResult);
    let largestImageSrc = imageScorer.run(scrapeResult.couldBeImageRecords);
    let isAvailable = !(scrapeResult.couldBeAvailabilityRecords.length > 0);
    let currencyTypeResult = currencyScorer.run(scrapeResult.couldBeCurrencyRecords);
    console.log("Src: ", largestImageSrc);
    console.log("Is available: ", isAvailable);
    console.log("Currency type: ", CurrencyType[currencyTypeResult])
}


app.post('/tracker/add', async (req, res) => {
    if(req.body){
        let url = req.body.url
        let owner = req.body.owner

        let scrapeResult: ScrapeResults = await scraper.launch(url);
        let priceAsInt = priceScorer.run(scrapeResult.allPageElementRecords);

        let newTracker: ProductTracker = {
            id: uuid.v4(),
            owner: owner,
            url: url,
            title: scrapeResult.title,
            initialPrice: priceAsInt,
            dateStartedTracking: Date.now(),
            imageUrl: null,
            trackingFrequency: TrackingFrequency.Daily,
            currencyType: "£",
            initialInstock: true,
            prettyPrice: parsePrettyPrice(priceAsInt, "£")
        }

        try {
            await trackerRepo.insertNewTracker(newTracker);
            res.status(200).json(newTracker);
        } catch(err){
            res.status(400).json(err);
        }
    }
})

app.get('/tracker/:userId', async (req, res) => {
    if(req.params.userId){
        let trackers: ProductTracker[] = await trackerRepo.getTrackerByUserId(req.params.userId);
        trackers.forEach(tracker => {
            tracker.prettyPrice = parsePrettyPrice(tracker.initialPrice, tracker.currencyType);
        })
        trackers = trackers.sort((a, b) => {
            return a.dateStartedTracking - b.dateStartedTracking
        })
        if(trackers){
            if(trackers.length === 0){
                res.status(201).send();
            }
            res.status(200).json(trackers);
        } else {
            res.status(400).send();
        }
    }
})

app.delete('/tracker/:trackerId', async (req, res) => {
    if(req.params.trackerId){
        try {
            await trackerRepo.deleteTrackerById(req.params.trackerId);
            res.status(200).json();
        } catch(err){
            res.status(400).send();
        }
    }
})

app.listen(process.env.PORT, () => {
    return console.log(`server is listening on ${process.env.PORT}`);
});

function parsePrettyPrice(input: number, currencyType: string): string{
    let lengthOfPriceString = input.toString().length;
    let priceAsString = input.toString();
    let decimalSlice = priceAsString.slice(lengthOfPriceString-2, lengthOfPriceString);
    return currencyType + priceAsString.slice(0, lengthOfPriceString-2) + "." + decimalSlice;
}
