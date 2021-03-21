import puppeteer from "puppeteer";
import {ElementBoundingBox, PageElementRecord} from "../models/PageElementRecord";
import {ScrapeResults} from "../models/ScrapeResults";

/*
* Scrape buckets:
* - Price
* - Availability
* - Image
* - Currency
 */

/*
* TODO :: Remove as much junk as possible e.g. script tags
* TODO :: Add in some filtering to remove as much noise from each individual couldBe function
 */

export class WebsiteScraper {
    constructor(){}

    async launch(url: string): Promise<ScrapeResults>{
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox','--disable-setuid-sandbox']
        })
        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        await page.goto(url);
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36");
        await page.waitForSelector('body');
        let pageTitle = await page.title();
        // page.on('console', event => {
        //     console.log(event._text);
        // })

        const nodes = await page.$$("body *");

        let pageElementRecords: PageElementRecord[] = await page.$$eval('body *', elements => {
            // console.log("Elements: ", JSON.stringify(elements));

            let records: PageElementRecord[] = [];
            elements.forEach(element => {
                // console.log("Element-tc: ", element.textContent.replace(/\s|\n|\r/g, ""));
                // console.log("Element-cn: ", element.className);
                // if(typeof(element.className) == 'string' && element.className.includes("range-revamp-price")){
                //     console.log("Here");
                //     console.log(typeof(element.className) != 'string')
                //     console.log(!element.textContent.replace(/\s/g, "").match(/(\d+\.\d{1,2})/g))
                //     console.log(!element.textContent.includes("£"))
                //     console.log(element.textContent.replace(/\s/g, "").length > 30)
                //     console.log(element.textContent.trim() === "")
                // }
                // records.push({
                //     tc: element.textContent,
                //     cn: element.className
                // })

                // let couldBePriceFn = couldBePrice;
                //
                // if(!couldBePriceFn(element)){
                //     return;
                // }

                let computedStyles = window.getComputedStyle(element);
                let fontSize = computedStyles["fontSize"];
                let textDecoration = computedStyles["textDecoration"];
                let color = computedStyles["color"];
                let bBox = element.getBoundingClientRect();

                let attributes = {};
                let attributeNames = element.getAttributeNames();

                attributeNames.forEach(attribute => {
                    attributes[attribute] = element.getAttribute(attribute);
                });

                /*
                * Trim and replace classname if there is a classname string in the element
                 */
                let className = "";
                if(element.className && typeof(element.className) == 'string'){
                    className = element.className.trim().replace(/\n/g, "").replace(/\r/g, "");
                } else {
                    className = element.className;
                }

                /*
                * Trim the textContent if there is any
                 */
                let textContent = "";
                if(element.textContent && typeof(element.className) == 'string'){
                    textContent = element.textContent.trim()
                } else {
                    textContent = element.textContent;
                }

                let record: PageElementRecord = {
                    bboxJson: JSON.stringify(bBox),
                    fontSize: fontSize,
                    textDecoration: textDecoration,
                    color: color,
                    className: className,
                    textContent: textContent, //.replace(/\s/g, ""),
                    tag: element.tagName,
                    id: element.id,
                    attributes: attributes
                };
                records.push(record);
                // console.log("FontSize: ", fontSize);
                // console.log("Element: ", element.className);
                // classLists.push(element.className);
            })
            return records;
        });

        const images = await page.evaluate(() => Array.from(document.images, e => e.src));

        let couldBePriceRecords = [];
        let couldBeAvailabilityRecords = [];
        let couldBeImageRecords = [];
        let couldBeCurrencyRecords = [];

        pageElementRecords.forEach(record => {
            if(this.couldBePrice(record)){
                couldBePriceRecords.push(record);
            }
            if(this.couldBeImage(record)){
                couldBeImageRecords.push(record);
            }
            if(this.couldBeAvailability(record)){
                couldBeAvailabilityRecords.push(record);
            }
            if(this.couldBeCurrency(record)){
                couldBeCurrencyRecords.push(record);
            }
        })

        // console.log("Data: ", pageElementRecords);
        // console.log("Length: ", pageElementRecords.length);
        // let json = JSON.stringify(pageElementRecords);

        return {
            title: pageTitle,
            allPageElementRecords: pageElementRecords,
            couldBePriceRecords: couldBePriceRecords,
            couldBeImageRecords: couldBeImageRecords,
            couldBeAvailabilityRecords: couldBeAvailabilityRecords,
            couldBeCurrencyRecords: couldBeCurrencyRecords
        };
    }

    couldBePrice(pageElementRecord: PageElementRecord): boolean {
        // console.log(element.className);

        if(!pageElementRecord.className) {
            // console.log("1")
            return false;
        }
        if(typeof(pageElementRecord.className) != 'string') {
            // console.log("2")
            return false;
        }
        // if(element.textContent.replace(/\s|\n|\r/g, "") === "") {
        //     console.log("3")
        //     return false;
        // }
        if(pageElementRecord.textContent.replace(/\s/g, "").trim().length > 15 || pageElementRecord.textContent.replace(/\s/g, "").trim().length <= 1) {
            // console.log("4")
            return false;
        }
        // if(!element.textContent.replace(/\s/g, "").match(/(\d+\.\d{1,2})/g)) {
        //     if(element.textContent.includes("£") || element.textContent.replace(/\s/g, "").match(/\d+/g)){
        //         return true;
        //     } else {
        //         console.log("6")
        //         return false;
        //     }
        // }
        // console.log(couldBePrice)
        return true;
    }

    couldBeImage(pageElementRecord: PageElementRecord): boolean {
        let tagsToIgnore = [
            "script", "video"
        ];

        if(pageElementRecord.tag.toLowerCase() == "img"){
            return true;
        }

        if("src" in pageElementRecord.attributes){
            return (pageElementRecord.tag.toLowerCase() in tagsToIgnore);
        }

        return false;
    }

    couldBeAvailability(pageElementRecord: PageElementRecord): boolean {
        //TODO :: Add in some kind of filtering to exclude massive strings/empty strings

        let bbox: ElementBoundingBox = JSON.parse(pageElementRecord.bboxJson);

        if(
            bbox.x === 0 &&
            bbox.y === 0 &&
            bbox.height === 0 &&
            bbox.width === 0
        ){
            return false;
        }

        // Ignore anything below 600 pixels height
        if(bbox.y > 600){
            return false;
        }

        let textContentStrings = [
            "unavailable",
            "not in stock",
            "out of stock"
        ];

        if(pageElementRecord.textContent.includes("unavailable")){
            console.log("Here");
        }

        let couldBeAvailability = textContentStrings.some(str => {
            return pageElementRecord.textContent.toLowerCase().includes(str);
        });

        // textContentStrings.forEach(string => {
        //     couldBeAvailability = pageElementRecord.textContent.toLowerCase().includes(string);
        //     if(couldBeAvailability){
        //         return;
        //     }
        // });
        return couldBeAvailability;
    }

    couldBeCurrency(pageElementRecord: PageElementRecord): boolean {
        let currencyCharacters = ["£", "$"];

        //TODO :: Add in some kind of filtering to exclude massive strings/only include strings with digits etc

        if(pageElementRecord.textContent.replace(/\s/g, "").trim().length > 50 || pageElementRecord.textContent.replace(/\s/g, "").trim().length <= 1) {
            return false;
        }

        let couldBeCurrency = false;
        currencyCharacters.forEach(char => {
            if(pageElementRecord.textContent.includes(char)){
                couldBeCurrency = true;
            }
        })
        return couldBeCurrency;
    }
}


