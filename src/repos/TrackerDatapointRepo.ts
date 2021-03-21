import {ProductTracker, ProductTrackerDbo} from "../models/ProductTracker";
import {PoolHandler} from "./PoolHandler";
import {PoolClient} from "pg";
import {TrackerData} from "../models/TrackerData";
import {TrackerDatapoint} from "../models/TrackerDatapoint";

export class TrackerDatapointRepo {

    private pool: PoolHandler
    constructor(pool: PoolHandler){
        this.pool = pool;
    }

    insertNewDatapoint = async (toInsert: TrackerDatapoint): Promise<void> => {
        let client: PoolClient = await this.pool.getClient()
        let query = "INSERT INTO tracker_datapoints" +
            " (url, price, date)" +
            " values ($1, $2, $3)"
        let values = [toInsert.url, toInsert.price, toInsert.date]
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if(error){
                    reject();
                    throw error;
                }
                if(results){
                    resolve();
                    return;
                }
                reject();
                return;
            })
        })
    }

    getAllDatapointsForUrl = async (url: string): Promise<any> => {
        let client: PoolClient = await this.pool.getClient()
        let query = "SELECT * FROM tracker_datapoints WHERE url = $1";
        let values = [url];
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if(error){
                    reject();
                    throw error;
                }
                if(results){
                    resolve(results.rows);
                    return;
                }
                reject();
                return;
            })
        })
    }
}



