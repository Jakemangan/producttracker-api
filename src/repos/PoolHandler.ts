import {Pool, PoolClient} from "pg";

export class PoolHandler {
    public pool: Pool;

    constructor(){
        this.initPool();
    }

    initPool = () => {
        const cnxString = process.env.DATABASE_URL;
        this.pool = new Pool({
            connectionString: cnxString,
            ssl: {
                rejectUnauthorized: false
            }
        })
    }

    async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

}
