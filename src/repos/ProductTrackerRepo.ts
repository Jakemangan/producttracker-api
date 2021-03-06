import {ProductTracker, ProductTrackerDbo} from "../models/ProductTracker";
import {PoolHandler} from "./PoolHandler";
import {PoolClient} from "pg";
import {TrackerData} from "../models/TrackerData";
import {TrackerConfig} from "../models/TrackerConfig";

export class ProductTrackerRepo {

    private pool: PoolHandler
    constructor(pool: PoolHandler){
        this.pool = pool;
    }

    // getTrackerById = async (): Promise<ProductTrackerDbo[]> => {
    //     let client = await this.pool.getClient();
    //     return new Promise((resolve, reject) => {
    //         client.query('SELECT * from product_trackers WHERE id = $1', (error, results) => {
    //             client.release();
    //             if (error) {
    //                 reject();
    //                 throw error;
    //             }
    //             if(results){
    //                 resolve(results.rows);
    //                 return;
    //             }
    //             reject();
    //             return;
    //         });
    //     })
    // }

    getAllTrackers = async (): Promise<ProductTracker[]> => {
        let client = await this.pool.getClient();
        let query = 'SELECT * from product_trackers';
        return new Promise((resolve, reject) => {
            client.query(query,(error, results) => {
                client.release();
                if (error) {
                    reject();
                    throw error;
                }
                if(results){
                    resolve(results.rows.map<ProductTracker>(row => this.productTrackerDboToObject(row)));
                    return;
                }
                reject();
                return;
            });
        })
    }

    getTrackersByUserId = async (userId: string): Promise<ProductTracker[]> => {
        let client = await this.pool.getClient();
        let query = 'SELECT * from product_trackers WHERE owner = $1';
        let values = [userId];
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if (error) {
                    reject();
                    throw error;
                }
                if(results){
                    resolve(results.rows.map<ProductTracker>(row => this.productTrackerDboToObject(row)));
                    return;
                }
                reject();
                return;
            });
        })
    }

    getTrackersById = async (id: string): Promise<ProductTracker> => {
        let client = await this.pool.getClient();
        let query = 'SELECT * from product_trackers WHERE id = $1';
        let values = [id];
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if (error) {
                    reject();
                    throw error;
                }
                if(results){
                    resolve(results.rows.map<ProductTracker>(row => this.productTrackerDboToObject(row))[0]);
                    return;
                }
                reject();
                return;
            });
        })
    }

    deleteTrackerById = async (trackerId: string): Promise<void> => {
        let client = await this.pool.getClient();
        let query = 'DELETE from product_trackers WHERE id = $1';
        let values = [trackerId];
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if (error) {
                    reject();
                    throw error;
                }
                if(results){
                    resolve();
                    return;
                }
                reject();
                return;
            });
        })
    }

    insertNewTracker = async (toInsert: ProductTracker): Promise<void> => {
        let client: PoolClient = await this.pool.getClient()
        let query = "INSERT INTO product_trackers" +
            "(id, url, title, image_url, initial_price, current_price, tracking_frequency, is_available, date_started_tracking, owner, currency_type, last_updated)" +
            "values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
        let values = [toInsert.id,
            toInsert.url,
            toInsert.title,
            toInsert.imageUrl,
            toInsert.priceData.initialPrice,
            toInsert.priceData.initialPrice,
            toInsert.trackingFrequency,
            toInsert.isAvailable,
            toInsert.dateStartedTracking,
            toInsert.owner,
            toInsert.currencyType,
            toInsert.dateStartedTracking]
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

    updateExistingTrackerByUrl = async (urlToUpdate: string, trackerData: TrackerData): Promise<void> => {
        let client: PoolClient = await this.pool.getClient();
        let query = "UPDATE product_trackers SET" +
            " title = $1," +
            "image_url = $2," +
            "current_price = $3," +
            "is_available = $4," +
            "last_updated = $5," +
            "currency_type = $6" +
            " WHERE url = $7"
        let values = [
            trackerData.title,
            trackerData.largestImageSrc,
            trackerData.currentPrice,
            trackerData.isAvailable,
            Date.now(),
            trackerData.currencyType,
            urlToUpdate
        ]
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

    updateExistingTrackerConfig = async (idToUpdate: string, trackerConfig: TrackerConfig): Promise<void> => {
        let client: PoolClient = await this.pool.getClient();
        let query = "UPDATE product_trackers SET" +
            " tracking_frequency = $1" +
            " WHERE id = $2"
        let values = [
            trackerConfig.trackingFrequency,
            idToUpdate
        ]
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

    productTrackerDboToObject(input: ProductTrackerDbo): ProductTracker{
        return {
            id: input.id,
            title: input.title,
            imageUrl: input.image_url,
            priceData: {
                currentPrice: input.current_price,
                initialPrice: input.initial_price,
                currentPricePretty: undefined,
                initialPricePretty: undefined,
                priceDifference: -1
            },
            isAvailable: input.is_available,
            trackingFrequency: input.tracking_frequency,
            dateStartedTracking: input.date_started_tracking,
            url: input.url,
            currencyType: input.currency_type,
            owner: input.owner,
            datapoints: undefined
        }
    }

    objectToProductTrackerDbo(input: ProductTracker): ProductTrackerDbo{
        return {
            id: input.id,
            title: input.title,
            image_url: input.imageUrl,
            initial_price: input.priceData.initialPrice,
            current_price: input.priceData.currentPrice,
            is_available: input.isAvailable,
            tracking_frequency: input.trackingFrequency,
            date_started_tracking: input.dateStartedTracking,
            url: input.url,
            owner: input.owner,
            currency_type: input.currencyType
        }
    }
}



