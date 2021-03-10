import {ElementBoundingBox, PageElementRecord} from "../models/PageElementRecord";
import {ElementImageRankingMap, PageElementImageRanking} from "../models/PageElementImageRanking";

export class ImageScorer{
    constructor(){}

    run(records: PageElementRecord[]): string {
        records = records.filter(x => this.elementYPositionIsLessThan600(x.bboxJson));
        let largestImageRecord = this.getLargestImageRecord(records);
        return largestImageRecord.attributes["src"];
    }

    private elementYPositionIsLessThan600(bboxJson: string): boolean{
        // console.log(bboxJson);
        let bbox: ElementBoundingBox = JSON.parse(bboxJson);

        if(
            bbox.x === 0 &&
            bbox.y === 0 &&
            bbox.height === 0 &&
            bbox.width === 0
        ){
            return false;
        }

        return bbox.y < 600;
    }

    private getLargestImageRecord(records: PageElementRecord[]) {
        let runningTotalImageSize = 0;
        let largestElementRecord: PageElementRecord = undefined;

        records.forEach(record => {
            let bbox: ElementBoundingBox = JSON.parse(record.bboxJson);
            if(
                bbox.x === 0 &&
                bbox.y === 0 &&
                bbox.height === 0 &&
                bbox.width === 0
            ){
                return;
            }

            let totalImageSize = bbox.height * bbox.width;

            if(totalImageSize > runningTotalImageSize){
                runningTotalImageSize = totalImageSize;
                largestElementRecord = record;
            }
        })

        return largestElementRecord;
    }
}
