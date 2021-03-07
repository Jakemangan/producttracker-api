"use strict";
/*
* Score criteria:
* - TextContent length is less than 30
* - Element does NOT have strikethrough (line-through)
* - TextContent contains a currency symbol
* - FontSize is the highest on the page
* - Classname contains "price"
* - BBox Y is less than 600
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scorer = void 0;
class Scorer {
    constructor() { }
    run(pageElementRecords) {
        this.largestFontSize = this.getLargestFontSize(pageElementRecords);
        console.log("Largest font size:", this.largestFontSize);
        let rankings = [];
        pageElementRecords.forEach(elementData => {
            rankings.push(this.scoreElement(elementData));
        });
        rankings.sort((a, b) => {
            if (a.totalScore === b.totalScore)
                return 0;
            if (a.totalScore > b.totalScore) {
                return -1;
            }
            else {
                return 1;
            }
        });
        // console.log(rankings);
        // console.log(rankings);
        console.log("Top 25 guesses: ");
        for (let i = 0; i < 25; i++) {
            console.log(rankings[i].elementData.textContent + " : " + rankings[i].totalScore + " (" + JSON.stringify(rankings[i].rankingsMap) + ")");
        }
        return rankings[0].elementData.textContent;
    }
    scoreElement(elementData) {
        let record = {
            yPosition: this.scoreBasedOnYPosition(elementData.bboxJson),
            largestFontSize: this.scoreBasedOnLargestFontSize(elementData.fontSize),
            presenceOfCurrency: this.scoreBasedOnPresenceOfCurrency(elementData.textContent),
            textContentLength: this.scoreBasedOnTextContentLength(elementData.textContent),
            priceInClassname: this.scoreBasedOnPriceInClassname(elementData.className),
            noStrikethrough: this.scoreBasedOnNoStrikethrough(elementData.textDecoration),
            emptyBasket: this.scoreBasedOnEmptyBasket(elementData.textContent),
            presenceOfDigits: this.scoreBasedOnPresenceOfDigits(elementData.textContent)
        };
        let runningScore = 0;
        Object.keys(record).forEach(key => {
            runningScore += record[key];
        });
        return {
            totalScore: runningScore,
            rankingsMap: record,
            elementData: elementData
        };
    }
    scoreBasedOnYPosition(bboxJson) {
        console.log(bboxJson);
        let bbox = JSON.parse(bboxJson);
        if (bbox.x === 0 &&
            bbox.y === 0 &&
            bbox.height === 0 &&
            bbox.width === 0) {
            return -1;
        }
        if (bbox.y < 600) {
            return 1;
        }
        else {
            return 0;
        }
    }
    scoreBasedOnLargestFontSize(fontsize) {
        let fontSize = parseInt(fontsize.replace("/px/g", ""));
        if (fontSize === this.largestFontSize) {
            return 1;
        }
        return 0;
    }
    scoreBasedOnPresenceOfCurrency(textContent) {
        if (textContent.includes("£") || textContent.includes("$")) {
            return 1;
        }
        return 0;
    }
    scoreBasedOnTextContentLength(textContent) {
        if (textContent.length < 30) {
            return 1;
        }
        return 0;
    }
    scoreBasedOnPriceInClassname(className) {
        if (className.toLowerCase().includes("price")) {
            return 1;
        }
        return 0;
    }
    scoreBasedOnNoStrikethrough(textDecoration) {
        if (!textDecoration.toLowerCase().includes("line-through")) {
            return 1;
        }
        return 0;
    }
    scoreBasedOnEmptyBasket(textContent) {
        if (textContent.includes("£0.00") || textContent.includes("$0.00")) {
            return -3;
        }
        return 0;
    }
    scoreBasedOnPresenceOfDigits(textContent) {
        if (textContent.match(/(\d+)/g)) {
            return 1;
        }
        return -5;
    }
    getLargestFontSize(elementData) {
        let current = null;
        elementData.forEach(element => {
            try {
                let fontSize = parseInt(element.fontSize.replace("/px/g", ""));
                if (fontSize && fontSize > current) {
                    current = fontSize;
                }
            }
            catch (err) {
                console.log("Element does not have font size");
            }
        });
        return current;
    }
}
exports.Scorer = Scorer;
//# sourceMappingURL=scorer.js.map