import { PoolClient } from "pg";
import { ConfirmedWebsite } from "../models/ConfirmedWebsite";
import { UserData } from "../models/UserData";
import { PoolHandler } from "./PoolHandler";

export class ConfirmedWebsiteRepo {

    private pool: PoolHandler
    constructor(pool: PoolHandler){
        this.pool = pool;
    }

    getByHostname = async (hostname: string): Promise<ConfirmedWebsite[]> => {
        let client: PoolClient = await this.pool.getClient()
        let query = "SELECT * FROM confirmed_websites WHERE hostname = $1";
        let values = [hostname];
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if(error){
                    reject();
                    throw error;
                }
                if(results){
                    resolve(results.rows.map<ConfirmedWebsite>(x => {
                      return {
                          url: x.url,
                          working: x.confirmed_working
                      }  
                    }));
                    return;
                }
                reject();
                return;
            })
        })
    }

    insertNewConfirmedWebsiteEntry = async (hostname: string, working: boolean): Promise<void> => {
        let client: PoolClient = await this.pool.getClient();
        let query = "INSERT INTO confirmed_websites (hostname, confirmed_working) values ($1, $2)";
        let values = [hostname, working];
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
}