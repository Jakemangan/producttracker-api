import { UserData } from "../models/UserData";
import { UserRepo } from "../repos/UserRepo";

export class UserService {
    constructor(private userRepo: UserRepo){}

    async getUserByEmail(email: string): Promise<UserData> {
        let userData = (await this.userRepo.getUserDataByEmail(email))[0];
        if(userData){
            return userData;
        }
        return null;
    }

    async getUserById(id: string): Promise<UserData> {
        let userData = (await this.userRepo.getUserDataById(id))[0];
        if(userData){
            return userData;
        }
        return null;
    }

    async getOrInitUser(email: string): Promise<UserData> {
        let userData = (await this.userRepo.getUserDataByEmail(email))[0];
        if(!userData){
            await this.userRepo.createNewUserProfile(email, '');
            userData = (await this.userRepo.getUserDataByEmail(email))[0];
            return userData;
        } else {
            return userData;
        }
    }
}