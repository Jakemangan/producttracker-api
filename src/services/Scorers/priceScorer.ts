/*
* Score criteria:
* - TextContent length is less than 30
* - Element does NOT have strikethrough (line-through)
* - TextContent contains a currency symbol
* - FontSize is the highest on the page
* - Classname contains "price"
* - BBox Y is less than 600
 */

import {ElementBoundingBox, PageElementRecord} from "../../models/PageElementRecord";
import {ElementPriceRankingMap, PageElementPriceRanking} from "../../models/PageElementPriceRanking";

export class PriceScorer {

    private largestFontSize: number;

    constructor(){}

    run(pageElementRecords: PageElementRecord[]): number {
        //TODO :: Make this largest font size of only elements that have digits in or match price regex
        this.largestFontSize = this.getLargestFontSize(pageElementRecords);
        // console.log("Largest font size:", this.largestFontSize);

        let rankings: PageElementPriceRanking[] = [];
        pageElementRecords.forEach(elementData => {
            rankings.push(this.scoreElement(elementData))
            if(elementData.textContent == "£625 pcm"){
                console.log("Here");
            }
        })

        rankings.sort((a, b) => {
            if(a.totalScore === b.totalScore) return 0;
            if(a.totalScore > b.totalScore){
                return -1
            } else {
                return 1;
            }
        })

        // console.log(rankings);
        // console.log(rankings);

        console.log("Top 25 guesses: ");
        for(let i = 0; i<25;i++){
            console.log(rankings[i].elementData.textContent + " : " + rankings[i].totalScore + " (" + JSON.stringify(rankings[i].rankingMap) + ")");
        }

        let selectedPrice = rankings[0].elementData.textContent;
        
        if(!selectedPrice.includes(".")){
            selectedPrice += ".00";
        }

        //Replace any non-digits with nothing
        selectedPrice = selectedPrice.replace(/[^\d\n]/g, "")

        return parseInt(selectedPrice);
    }

    private scoreElement(record: PageElementRecord): PageElementPriceRanking {
        let rankingMap: ElementPriceRankingMap = {
            yPosition: this.scoreBasedOnYPosition(record.bboxJson),
            largestFontSize: this.scoreBasedOnLargestFontSize(record.fontSize),
            presenceOfCurrency: this.scoreBasedOnPresenceOfCurrency(record.textContent),
            textContentLength: this.scoreBasedOnTextContentLength(record.textContent),
            priceInClassname: this.scoreBasedOnPriceInClassname(record.className),
            noStrikethrough: this.scoreBasedOnNoStrikethrough(record.textDecoration),
            emptyBasket: this.scoreBasedOnEmptyBasket(record.textContent),
            presenceOfDigits: this.scoreBasedOnPresenceOfDigits(record.textContent),
            moreThanOneCurrencyValue: this.scoreBasedOnMoreThanOneCurrencyValue(record.textContent)
        }

        let runningScore = 0;

        Object.keys(rankingMap).forEach(key => {
            runningScore += rankingMap[key];
        })

        return {
            totalScore: runningScore,
            rankingMap: rankingMap,
            elementData: record
        }
    }

    private scoreBasedOnYPosition(bboxJson: string): number{
        // console.log(bboxJson);
        let bbox: ElementBoundingBox = JSON.parse(bboxJson);

        if(
            bbox.x === 0 &&
            bbox.y === 0 &&
            bbox.height === 0 &&
            bbox.width === 0
        ){
            return -1;
        }

        if(bbox.y < 700){
            return 1;
        } else {
            return 0;
        }
    }

    private scoreBasedOnLargestFontSize(fontsize: string): number{
        let fontSize = parseInt(fontsize.replace("/px/g", ""));
        if(fontSize === this.largestFontSize){
            return 1;
        }

        return 0;
    }

    private scoreBasedOnPresenceOfCurrency(textContent: string): number{
        if(textContent.includes("£") || textContent.includes("$")){
            return 3;
        }

        return 0;
    }

    private scoreBasedOnTextContentLength(textContent: string): number{
        if(textContent.length < 30){
            return 1;
        }

        return 0;
    }

    private scoreBasedOnPriceInClassname(className: string): number{
        if(className.toLowerCase().includes("price")){
            return 1;
        }

        return 0;
    }

    private scoreBasedOnNoStrikethrough(textDecoration: string): number{
        if(!textDecoration.toLowerCase().includes("line-through")){
            return 1;
        }

        return 0;
    }

    private scoreBasedOnEmptyBasket(textContent: string){
        if(textContent.includes("£0.00") || textContent.includes("$0.00")){
            return -3;
        }
        return 0;
    }

    private scoreBasedOnPresenceOfDigits(textContent: string){
        if(textContent.match(/(\d+)/g)){
            return 1;
        }
        return -5;
    }

    private scoreBasedOnMoreThanOneCurrencyValue(textContent: string){
        let total = (textContent.split("£").length-1) + (textContent.split("$").length-1);
        if(total > 1){
            return -1;
        } else {
            return 0;
        }
    }

    private getLargestFontSize(elementData: any): number{
        let current = null;
        elementData.forEach(element => {
            try {
                let fontSize = parseInt(element.fontSize.replace("/px/g", ""));
                if(fontSize && fontSize > current){
                    current = fontSize;
                }
            } catch(err) {
                // console.log("Element does not have font size");
            }
        })
        return current;
    }

    
}
