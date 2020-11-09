import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../store';
import {History} from 'history';
import {User} from "../../interfaces/user";
import {Dispatch} from 'redux';
import * as tokensService from '../../store/demo/tokens.service'
import * as storeService from '../../store/demo/store.service'
import {DemoActions} from '../../store/demo/types';
import config from "../../../util/config";
import {FetchParams, makeFetch} from "../Interface";

const mapStateToProps = ({demo}: IRootState) => {
    const {authToken, idToken, loading} = demo;
    return {authToken, idToken, loading};
}

//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        setAuthToken: (token: string) => tokensService.setAuthToken(dispatch, token),
        setIdToken: (token: string) => tokensService.setIdToken(dispatch, token),
        loadStore: () => storeService.loadStore(dispatch),
        saveStore: () => storeService.saveStore(dispatch),
    }
}

interface IProps {
    history: History
    /* other props for ChildComponent */
}

type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

interface IState {
    smth: string

}

class SignUp extends React.Component<ReduxType, IState> {

    userName: string
    password: string
    email: string
    fetchesService: any

    // Initialize the state
    constructor(props: ReduxType) {
        super(props);

        this.state = {
            smth: "test state action"
        }

        this.userName = ""
        this.email = ""
        this.password = ""
    }


    signUp = (event: any) => {
        event.preventDefault()

        var userCognitoId: string | null = null
        //alert(this.userName + " " + this.password + " " + this.email + " test state: " + this.state.smth)

        let userData = {
            username: this.userName,
            password: this.password,
            email: this.email,
        }


        const {authToken, idToken, loading} = this.props;

        const fetchParams: FetchParams = {
            url: '/auth/signUp',
            authToken: "",
            idToken: "",
            method: 'POST',
            body: userData,

            actionDescription: "sign up"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            userCognitoId = jsonRes.data.UserSub

            if (userCognitoId == null) {
                alert("ERROR WITH COGNITO")
                return
            }

            //add to the database
            const userData2: User = {
                name: this.userName,
                roleId: config.AppConfig.RolesIds.user,
                cognitoUserId: userCognitoId,
                signUpDate: Date()
            }


            const {authToken, idToken, loading} = this.props;

            const fetchParams: FetchParams = {
                url: '/users/create',
                authToken: authToken,
                idToken: idToken,
                method: 'POST',
                body: userData2,

                actionDescription: "create user"
            }

            makeFetch<any>(fetchParams).then(jsonRes => {
                console.log(jsonRes)
                alert("Successfully signed you up, now ask the Administrator to confirm your account.")
                this.props.history.push("/")
            }).catch(error => alert("ERROR: " + error))


            //add tokens to the store and redirect to the client page
            //TODO YOU NEED TO CONFIRM THE USER <----(!) and then you will be able to sign in after sigh up
            // fetch('/auth/signIn',{
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //         // 'Content-Type': 'application/x-www-form-urlencoded',
            //     },
            //     body: JSON.stringify(userData)
            // })
            //     .then(res => res.json()
            //     )
            //     .then(data => {
            //         console.log("JSON res: " + data.data.AuthenticationResult)
            //         // @ts-ignore
            //
            //
            //         // @ts-ignore
            //         this.props.setAuthToken(data.data.AuthenticationResult.AccessToken)
            //         this.props.setIdToken(data.data.AuthenticationResult.IdToken)
            //         this.props.saveStore()
            //
            //         this.props.history.push("/private/area")
            //         // if(res.ok)
            //         //     alert("Successfully signed in")
            //         // else alert("Error, see logs for more info")
            //
            //     })
            //     .catch(error => alert("Fetch error: " + error))
        }).catch(error => alert("ERROR: " + error))
    }

    _onChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.userName = (e.target as HTMLInputElement).value
        this.setState({smth: (e.target as HTMLInputElement).value})
    }
    _onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.email = (e.target as HTMLInputElement).value
    }
    _onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.password = (e.target as HTMLInputElement).value
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        return (
            <Form>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control onChange={this._onChangeEmail} type="email" placeholder="Enter email"/>
                </Form.Group>
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control onChange={this._onChangeUserName} type="string" placeholder="Your username"/>
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control onChange={this._onChangePassword} type="password" placeholder="Password"/>
                </Form.Group>

                <Button onClick={this.signUp} variant="primary" type="submit">Sign Up</Button>
            </Form>
        );
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(SignUp);