import {Provider} from "../provider";
import {TrackerDatapoint} from "../models/TrackerDatapoint";

export class AuthController{

    provider: Provider;

    constructor(provider: Provider){
        this.provider = provider;
    }

    getUserDataByEmail = async(req,res) => {
        if(!req.params.email){
            res.status(400).json("No email parameter.");
        }

        // if(jwtEmail != req.params.email){
        //     res.status(401).send("Unauthorised access.");
        // }

        let userData = await this.provider.UserService.getOrInitUser(req.params.email);
        if(userData){
            res.status(200).json(userData);
        } else {
            res.status(400).json("Bad request");
        }
    }
}
