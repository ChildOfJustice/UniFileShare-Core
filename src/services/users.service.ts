import {User} from "../interfaces/user"

class UsersService {


    private extractUserInfoFromToken(idToken: string): User {
        let user: User = {
            id: "",
            name: "",
            role: ""
        }
        return user
    }



}