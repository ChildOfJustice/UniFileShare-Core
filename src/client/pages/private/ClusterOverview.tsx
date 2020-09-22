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
import {Cluster, FileMetadata} from "../../../interfaces/databaseTables";
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
    clusterId: string
}


type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


class ClusterOverview extends React.Component<ReduxType, IState> {
    public state: IState = {
        files: [],
    }


    constructor(props: ReduxType) {
        super(props);
    }

    componentDidMount() {
        // @ts-ignore
        this.loadFilesMetadata(this.props.match.params.clusterId)

        // @ts-ignore
        //alert("!!!!=> " + this.props.match.params.clusterId)
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

    loadFilesMetadata = (clusterId: number) => {
        fetch('/files/metadata/findAll?clusterId='+clusterId,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                //console.log(res)
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                    this.setState({files: jsonRes})
                })

                if(res.ok)
                    console.log("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    render() {

        var counter = 1
        return (
            <div>
                <LinkContainer to={// @ts-ignore
                    "/private/uploadFile/" + this.props.match.params.clusterId}>
                    <Navbar.Brand>Upload file</Navbar.Brand>
                </LinkContainer>

                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>File Name</th>
                        <th>Cloud provider</th>
                        <th>File owner</th>
                        <th>Uploaded by</th>
                        <th>File size (MBs)</th>
                        <th>    User</th>
                        <th>Tags</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.files.map(
                        (fileMetadata: FileMetadata) =>
                            <tr onClick={() => this.downloadFile(fileMetadata.S3uniqueName, fileMetadata.cloud)}>
                                <td key={counter}>
                                    {counter++}
                                </td>
                                <td key={fileMetadata.S3uniqueName}>
                                    {fileMetadata.name}
                                </td>
                                <td>
                                    {fileMetadata.cloud}
                                </td>
                                <td>
                                    {fileMetadata.uploadedBy}
                                </td>
                                <td>
                                    {fileMetadata.ownedBy}
                                </td>
                                <td>
                                    {fileMetadata.sizeOfFile_MB}
                                </td>
                                <td>
                                    {fileMetadata.tagsKeys.map(keyName => <div>{keyName}</div>) }
                                </td>
                                <td>
                                    {fileMetadata.tagsValues.map(keyName => <div>{keyName}</div>) }
                                </td>
                            </tr>
                    )}

                    </tbody>
                </Table>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(ClusterOverview);