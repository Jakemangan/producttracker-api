"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scraper_1 = require("./services/scraper");
const scorer_1 = require("./services/scorer");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const bodyParser = __importStar(require("body-parser"));
// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.tesco.com/groceries/en-GB/products/254896546?preservedReferrer=https://www.tesco.com/";
// let url = "https://www.ikea.com/gb/en/p/godmorgon-high-cabinet-brown-stained-ash-effect-40457851/";
// let url = "https://www.amazon.co.uk/gp/product/B07VDBFBV9?pf_rd_r=CHVJMV78BRXMM5A3ZMTF&pf_rd_p=6e878984-68d5-4fd2-b7b3-7bc79d9c8b60&pd_rd_r=2989b131-9b9e-4ce1-ad09-9d27593b5c98&pd_rd_w=nSoQe&pd_rd_wg=7HJ3w&ref_=pd_gw_unk";
// let url = "https://www.jacksonsart.com/holbein-duo-aqua-watermixable-oil-paint-elite-colours";
const options = {
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
const app = express_1.default();
app.use(bodyParser.json());
app.use(cors_1.default());
app.post('/price', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body) {
        let url = req.body.url;
        let scraper = new scraper_1.Scraper();
        let scorer = new scorer_1.Scorer();
        let pageData = yield scraper.launch(url);
        let priceOnPage = scorer.run(pageData);
        if (priceOnPage) {
            res.status(200).json(priceOnPage);
        }
    }
}));
app.listen(process.env.PORT, () => {
    return console.log(`server is listening on ${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map