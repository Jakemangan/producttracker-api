import {ProductTracker, ProductTrackerDbo} from "../models/ProductTracker";
import {PoolHandler} from "./PoolHandler";
import {PoolClient} from "pg";
import {TrackerData} from "../models/TrackerData";
import {TrackerDatapoint} from "../models/TrackerDatapoint";
import { UserData, UserDataDbo } from "../models/UserData";

export class UserRepo {

    private pool: PoolHandler
    constructor(pool: PoolHandler){
        this.pool = pool;
    }

    getUserDataByEmail = async (email: string): Promise<UserData[]> => {
        let client: PoolClient = await this.pool.getClient()
        let query = "SELECT * FROM users WHERE email = $1";
        let values = [email];
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if(error){
                    reject();
                    throw error;
                }
                if(results){
                    resolve(results.rows.map<UserData>(x => this.userDataDboToObject(x)));
                    return;
                }
                reject();
                return;
            })
        })
    }

    getUserDataById = async (id: string): Promise<UserData[]> => {
        let client: PoolClient = await this.pool.getClient()
        let query = "SELECT * FROM users WHERE id = $1";
        let values = [id];
        return new Promise((resolve, reject) => {
            client.query(query, values, (error, results) => {
                client.release();
                if(error){
                    reject();
                    throw error;
                }
                if(results){
                    resolve(results.rows.map<UserData>(x => this.userDataDboToObject(x)));
                    return;
                }
                reject();
                return;
            })
        })
    }

    createNewUserProfile = async (email: string, name: string): Promise<void> => {
        let client: PoolClient = await this.pool.getClient()
        let query = "INSERT INTO users (name, email) values ($1, $2)"
        let values = [name, email];
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

    userDataDboToObject = (userDataDbo: UserDataDbo): UserData => {
        return {
            id: userDataDbo.id,
            name: userDataDbo.name,
            email: userDataDbo.email,
            userRole: userDataDbo.user_role
        };
    }
}



