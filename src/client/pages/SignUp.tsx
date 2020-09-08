import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { connect } from 'react-redux';
import { IRootState } from '../../store';
import exp = require("constants");


interface IProps {

}
interface IState {
    smth: string

}

export default class SignUp extends React.Component<IProps, IState> {

    userName: string
    password: string
    email: string

    // Initialize the state
    constructor(props: IProps){
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

        // this.props.setKey("TEST up key");
        // alert("!!!->" + this.props.authKey)

        //console.log("SIGN UP REQUEST: ")
        //const {username, password, email} = this.state
        alert(this.userName + " " + this.password + " " + this.email + " test state: " + this.state.smth)


        let userData = {
            username: this.userName,
            password: this.password,
            email: this.email,
            // name: "TestName",
            // family_name: "TestFamilyName",
            // birthdate: "1980-10-29"
        }

        fetch('/auth/signUp',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(userData)
        })
            .then(res => {
                let response_ = res.json()
                console.log(response_)
                if(res.ok)
                    alert("Successfully signed you up")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
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
                    <Form.Control onChange={this._onChangeEmail} type="email" placeholder="Enter email" />
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control onChange={this._onChangePassword} type="password" placeholder="Password" />
                </Form.Group>
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control onChange={this._onChangeUserName} type="string" placeholder="Your username" />
                </Form.Group>
                <Button onClick={this.signUp} variant="primary" type="submit">Sign Up</Button>
            </Form>
        );
    }
}

//export default connect(mapStateToProps, mapDispatcherToProps)(SignUp);