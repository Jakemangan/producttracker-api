import {Scraper} from "./src/services/scraper";
import {Scorer} from "./src/services/scorer";
import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import {PageElementRecord} from "./src/models/PageElementRecord";

// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.tesco.com/groceries/en-GB/products/254896546?preservedReferrer=https://www.tesco.com/";
// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.amazon.co.uk/gp/product/B07VDBFBV9?pf_rd_r=CHVJMV78BRXMM5A3ZMTF&pf_rd_p=6e878984-68d5-4fd2-b7b3-7bc79d9c8b60&pd_rd_r=2989b131-9b9e-4ce1-ad09-9d27593b5c98&pd_rd_w=nSoQe&pd_rd_wg=7HJ3w&ref_=pd_gw_unk";
// let url = "https://www.jacksonsart.com/holbein-duo-aqua-watermixable-oil-paint-elite-colours";

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

app.post('/price', async (req, res) => {
    if(req.body){
        let url = req.body.url
        let scraper = new Scraper();
        let scorer = new Scorer();

        let pageData: PageElementRecord[] = await scraper.launch(url);
        let priceOnPage = scorer.run(pageData);
        if(priceOnPage){
            res.status(200).send(priceOnPage);
        }
    }
})

app.listen(process.env.PORT, () => {
    return console.log(`server is listening on ${process.env.PORT}`);
});





