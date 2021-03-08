import {ProductTracker, ProductTrackerDbo} from "../models/ProductTracker";
import {PoolHandler} from "./PoolHandler";
import {PoolClient} from "pg";

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

    getTrackerByUserId = async (userId: string): Promise<ProductTracker[]> => {
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
            "(id, url, title, image_url, initial_price, tracking_frequency, initial_instock, date_started_tracking, owner, currency_type)" +
            "values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
        let values = [toInsert.id,
            toInsert.url,
            toInsert.title,
            toInsert.imageUrl,
            toInsert.initialPrice,
            toInsert.trackingFrequency,
            toInsert.initialInstock,
            toInsert.dateStartedTracking,
            toInsert.owner,
            toInsert.currencyType]
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
            initialPrice: input.initial_price,
            initialInstock: input.initial_instock,
            trackingFrequency: input.tracking_frequency,
            dateStartedTracking: input.date_started_tracking,
            url: input.url,
            currencyType: input.currency_type,
            owner: input.owner,
            prettyPrice: undefined
        }
    }

    objectToProductTrackerDbo(input: ProductTracker): ProductTrackerDbo{
        return {
            id: input.id,
            title: input.title,
            image_url: input.imageUrl,
            initial_price: input.initialPrice,
            initial_instock: input.initialInstock,
            tracking_frequency: input.trackingFrequency,
            date_started_tracking: input.dateStartedTracking,
            url: input.url,
            owner: input.owner,
            currency_type: input.currencyType
        }
    }
}



