import puppeteer from "puppeteer";
import {text} from "express";
import {PageElementRecord} from "../models/PageElementRecord";

export class Scraper{
    constructor(){}

    async launch(url: string): Promise<PageElementRecord[]>{
        let browser = await puppeteer.launch({headless: true});
        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        await page.goto(url);
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36");
        await page.waitForSelector('body');

        page.on('console', event => {
            console.log(event._text);
        })

        const nodes = await page.$$("body *");

        let data: PageElementRecord[] = await page.$$eval('body *', elements => {
            // console.log("Elements: ", JSON.stringify(elements));

            let records = [];
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

                let couldBePriceFn = couldBePrice;

                if(!couldBePriceFn(element)){
                    return;
                }

                let computedStyles = window.getComputedStyle(element);
                let fontSize = computedStyles["fontSize"];
                let textDecoration = computedStyles["textDecoration"];
                let color = computedStyles["color"];
                let bBox = element.getBoundingClientRect();
                let record: PageElementRecord = {
                    bboxJson: JSON.stringify(bBox),
                    fontSize: fontSize,
                    textDecoration: textDecoration,
                    color: color,
                    className: element.className.trim().replace(/\n/g, "").replace(/\r/g, ""),
                    textContent: element.textContent.trim().replace(/\s/g, ""),
                    tag: element.tagName,
                    id: element.id
                }
                records.push(record);
                // console.log("FontSize: ", fontSize);
                // console.log("Element: ", element.className);
                // classLists.push(element.className);
            })
            return records;


            /*
            * Function definition
             */
            function couldBePrice(element: any): boolean {
                console.log(element.className);

                let couldBePrice = true;
                if(!element.className) {
                    console.log("1")
                    return false;
                }
                if(typeof(element.className) != 'string') {
                    console.log("2")
                    return false;
                }
                // if(element.textContent.replace(/\s|\n|\r/g, "") === "") {
                //     console.log("3")
                //     return false;
                // }
                if(element.textContent.replace(/\s/g, "").trim().length > 15 || element.textContent.replace(/\s/g, "").trim().length <= 1) {
                    console.log("4")
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
                console.log(couldBePrice)
                return couldBePrice;
            }
        })

        // console.log("Data: ", data);
        // console.log("Length: ", data.length);
        // let json = JSON.stringify(data);
        return data;
    }


}


