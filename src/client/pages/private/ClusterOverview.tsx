import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { connect } from 'react-redux';
import { IRootState } from '../../../store';

const mapStateToProps = ({ demo }: IRootState) => {
    const { authToken, idToken, loading } = demo;
    return { authToken, idToken, loading };
}

import { Dispatch } from 'redux';
import * as asyncactions from '../../../store/demo/async-actions';
import * as tokensService from '../../../store/demo/tokens.service'
import * as storeService from '../../../store/demo/store.service'
import { DemoActions } from '../../../store/demo/types';
import {NavItem, Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import {FileMetadata} from "../../../interfaces/databaseTables";
import * as AWS from "aws-sdk";
import config from "../../../../util/config";


//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        loadStore: () => storeService.loadStore(dispatch),
    }
}

interface IState {
    files: FileMetadata[]
}
interface IProps {
    clusterName: string
}


type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


class ClusterOverview extends React.Component<ReduxType, IState> {

    constructor(props: ReduxType) {
        super(props);
    }

    componentDidMount() {
        //TODO
        //loadFilesMetadata(this.props.clusterName)
        // @ts-ignore
        alert("!!!!=> " + this.props.match.params.name)
        this.props.loadStore()
    }
    downloadFile = (fileName:string, cloud:string) => {
        if (cloud == 'AWS'){

            AWS.config.update({
                region: config.AWS.S3.bucketRegion,
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId
                })
            });

            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: config.AWS.S3.bucketName}
            });

            var promise = s3.getSignedUrlPromise('getObject', {
                Bucket: config.AWS.S3.bucketName,
                Key: fileName
            });
            promise.then(function(url) {
                window.open( url, '_blank' );
                console.log('The URL is', url);
            }, function(err) { alert("error") });


        }

        // if(cloud == 'Azure'){
        //
        //     var url = "https://"+storageAccount+".blob.core.windows.net/"+storageName+"/" + fileName;
        //     var now = (new Date()).toUTCString();
        //
        //     var method = "GET";
        //     var headerResource = "x-ms-date:"+ now + "\nx-ms-version:2019-07-07";
        //     var canonicalizedResource = "/" + storageAccount + "/"+storageName+"/"+fileName;
        //     var contentEncoding = "";
        //     var contentLanguage = "";
        //     var contentLength = "";
        //     var contentMd5 = "";
        //     var contentType = "";
        //     var date = "";
        //     var ifModifiedSince = "";
        //     var ifMatch = "";
        //     var ifNoneMatch = "";
        //     var ifUnmodifiedSince = "";
        //     var range = "";
        //     var stringToSign = method + "\n" + contentEncoding + "\n" + contentLanguage + "\n" + contentLength + "\n" + contentMd5 + "\n" + contentType + "\n" + date + "\n" + ifModifiedSince + "\n" + ifMatch + "\n" + ifNoneMatch + "\n" + ifUnmodifiedSince + "\n" + range + "\n" + headerResource + "\n" + canonicalizedResource;
        //
        //     console.log("StringToSign: " + stringToSign);
        //
        //     var secret = CryptoJS.enc.Base64.parse(storageKey);
        //     var hash = CryptoJS.HmacSHA256(stringToSign, secret);
        //     var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
        //     var signature = hashInBase64;
        //
        //
        //     var AuthorizationHeader = "SharedKey " + storageAccount + ":" + signature;
        //
        //
        //     var xhttp = new XMLHttpRequest();
        //
        //     xhttp.addEventListener('load', function() {
        //         console.log(this.statusText);
        //         if(this.statusText == "OK"){
        //             const urlBlob = window.URL.createObjectURL(this.response);
        //             const a = document.createElement('a');
        //             a.style.display = 'none';
        //             a.href = urlBlob;
        //             a.download = fileName;
        //             document.body.appendChild(a);
        //             a.click();
        //             window.URL.revokeObjectURL(urlBlob);
        //             a.remove();
        //         } else {
        //             alert(this.statusText);
        //         }
        //     });
        //     xhttp.addEventListener('error', () => console.log("Request to "+url+" failed"));
        //
        //     xhttp.open("GET", url, true);
        //     xhttp.responseType = 'blob';
        //     xhttp.setRequestHeader("Cache-Control", "no-cache, must-revalidate, no-store");
        //     xhttp.setRequestHeader("Authorization", AuthorizationHeader);
        //     xhttp.setRequestHeader("x-ms-date", now);
        //     xhttp.setRequestHeader("x-ms-version", "2019-07-07");
        //     xhttp.send();
        //
        // }

    }

    loadFilesMetadata = (clusterName: string) => {

        fetch('/db/findAll?clusterName='+clusterName,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                console.log(res)
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if(res.ok)
                    alert("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        const clusterOverviewPage = (
            <div>
                <NavItem eventKey={7}>Smth</NavItem>
                <Navbar bg="light">
                    <LinkContainer to="/private/uploadFile">
                        <Navbar.Brand>Upload file</Navbar.Brand>
                    </LinkContainer>
                </Navbar>
                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cluster</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.files.map(
                        f => <tr onClick={() => this.downloadFile(f.S3uniqueName, f.cloud)}>
                            <td key={"number"}>
                                {" "}
                            </td>
                            <td key={f.name}>
                                {f}
                            </td>
                        </tr>
                    )}

                    </tbody>
                </Table>
            </div>

        )


        return (
            clusterOverviewPage

        )
    }


}

export default connect(mapStateToProps, mapDispatcherToProps)(ClusterOverview);