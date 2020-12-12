import Jumbotron from "react-bootstrap/Jumbotron";
import * as React from "react";
import * as AWS from "aws-sdk"
import { v4 as uuidv4 } from 'uuid'

import config from "../../../../util/config";
import {IRootState} from "../../../store";
import {Dispatch} from "redux";
import {DemoActions} from "../../../store/demo/types";
import * as storeService from "../../../store/demo/store.service";
import {decodeIdToken} from "../../../interfaces/user";
import {connect} from "react-redux";
import Button from "react-bootstrap/Button";
import {FetchParams, makeFetch} from "../../Interface";

///CONFIG
//AZURE:
// var storageAccount = "SECRET";
// var storageName = "SECRET";
// var storageKey = "SECRET";
//^

const mapStateToProps = ({demo}: IRootState) => {
    const {authToken, idToken, loading} = demo;
    return {authToken, idToken, loading};
}

//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        loadStore: () => storeService.loadStore(dispatch),
    }
}
interface IProps {
    clusterId: string
}
type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    userId: string
    canUpload: boolean
}


// eslint-disable-next-line react/display-name,@typescript-eslint/explicit-module-boundary-types
class UploadFile extends React.Component<ReduxType, IState> {

    tagIndex = 1
    public state: IState = {
        userId: '',
        canUpload: false
    }

    constructor(props: ReduxType) {
        super(props);
    }

    async componentDidMount() {
        await this.props.loadStore()

        await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
    }

    async checkStorageSizeLimitation(fileSize: number) {

        if (fileSize >= config.AppConfig.maxUserStorageSize_MB){
            this.setState({canUpload: false})
            return
        }


        const {authToken, idToken, loading} = this.props;


        let clusterOwnerUserId = ""

        let fetchParams: FetchParams = {
            // @ts-ignore
            url: '/clusters?clusterId='+this.props.match.params.clusterId,
            authToken: authToken,
            idToken: idToken,
            method: 'GET',
            body: null,

            actionDescription: "get cluster to check available storage size"
        }

        await makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            clusterOwnerUserId = jsonRes[0].ownerUserId
        }).catch(error => alert("ERROR: " + error))




        fetchParams = {
            url: '/files/metadata/calcUsedSize?ownerUserId='+clusterOwnerUserId,
            authToken: authToken,
            idToken: idToken,
            method: 'GET',
            body: null,

            actionDescription: "get used storage size"
        }

        await makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            if(jsonRes[0].usedStorageSize == null) {
                //alert("There is no info about your used storage size. Please, contact the administrator.")
                this.setState({canUpload: true})
            }
            else {
                //alert("SIZE IS: " + (fileSize + jsonRes[0].usedStorageSize))
                if(fileSize + jsonRes[0].usedStorageSize < config.AppConfig.maxUserStorageSize_MB)
                    this.setState({canUpload: true})
                else
                    this.setState({canUpload: false})
            }
        }).catch(error => alert("ERROR: " + error))
    }

     uploadFile = () => {
        var cloudCombobox = document.getElementById("cloudCombobox");
        // @ts-ignore
        var itemValue = cloudCombobox.options[cloudCombobox.selectedIndex].value;


        // @ts-ignore
        var defaultTagKey1 = document.getElementById('defaultTagKey1').value;
        // @ts-ignore
        var defaultTagValue1 = document.getElementById('defaultTagValue1').value;
        // @ts-ignore
        var defaultTagKey2 = document.getElementById('defaultTagKey2').value;
        // @ts-ignore
        var defaultTagValue2 = document.getElementById('defaultTagValue2').value;
        // @ts-ignore
        var defaultTagKey3 = document.getElementById('defaultTagKey3').value;
        // @ts-ignore
        var defaultTagValue3 = document.getElementById('defaultTagValue3').value;


        var otherTags: any[][] = [];
        var userTagsKeys: string[] = [];
        var userTagsValues: string[] = [];
        otherTags.push([defaultTagKey1, defaultTagValue1]);
        otherTags.push([defaultTagKey2, defaultTagValue2]);
        otherTags.push([defaultTagKey3, defaultTagValue3]);



        for (let i = 0; i < this.tagIndex; i++) {
            // @ts-ignore
            var element = [document.getElementById('tagKey'+(i+1)).value, document.getElementById('tagValue'+(i+1)).value];
            if(element[0] != ""){
                userTagsKeys.push(element[0])
                userTagsValues.push(element[1])
                otherTags.push(element);
            }
        }

        function compare( a: any[], b: any[] ) {
            if ( a[0] < b[0] ){
                return -1;
            }
            if ( a[0] > b[0] ){
                return 1;
            }
            return 0;
        }

        otherTags.sort( compare );


        if(itemValue == "AWS"){


            AWS.config.region = config.AWS.region; // Region
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId,
            });

            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: config.AWS.S3.bucketName}
            });



            // @ts-ignore
            var files = document.getElementById('fileToUpload').files;
            var file = files[0];
            if(typeof file == "undefined" || typeof file.name == "undefined"){
                alert("Choose the file first");
            }


            //SEND Metadata TO DB
            const metadata = {
                id: null,
                name: file.name,
                // @ts-ignore
                S3uniqueName: this.props.match.params.clusterId + "/" + uuidv4(),
                cloud: "AWS",
                ownedBy: defaultTagValue1,
                uploadedBy: defaultTagValue2,
                sizeOfFile_MB: file.size / 1024 / 1024,
                tagsKeys: userTagsKeys,
                tagsValues: userTagsValues,
                // @ts-ignore
                clusterId: this.props.match.params.clusterId
            };

            this.checkStorageSizeLimitation(metadata.sizeOfFile_MB).then( () => {

                if (!this.state.canUpload) {
                    //TODO beautiful error message with offer to buy some free space
                    alert("You have acceded your storage limit. Please, buy some more!")
                    return
                }

                const {authToken, idToken, loading} = this.props;

                const fetchParams: FetchParams = {
                    url: '/files/metadata/create',
                    authToken: authToken,
                    idToken: idToken,
                    method: 'POST',
                    body: metadata,

                    actionDescription: "create file metadata"
                }

                makeFetch<any>(fetchParams).then(fileInfo => {
                    const params = {
                        Bucket: config.AWS.S3.bucketName,
                        Key: metadata.S3uniqueName,
                        Body: file,
                    };


                    const canonicalTagArray = [];
                    for (let i = 0; i < otherTags.length; i++) {
                        var element2 =  {Key: otherTags[i][0], Value: otherTags[i][1]};
                        canonicalTagArray.push(element2);
                    }

                    if(canonicalTagArray.length == 0){
                        var upload = new AWS.S3.ManagedUpload({
                            params: params
                        });
                    } else{
                        var upload = new AWS.S3.ManagedUpload({
                            params: params,
                            tags: canonicalTagArray
                        });
                    }

                    var promise = upload.promise();

                    promise.then(
                        function(data) {
                            alert("File uploaded successfully.");
                            window.close();
                        },
                        function(err) {
                            console.log(err.message);
                            return alert("There was an error: " + err.message);
                        }
                    );

                }).catch(error => alert("ERROR: " + error))


                }
            )

        }
        // if(itemValue == "Azure"){
        //     alert("This cloud provider is not supported for now")
        //     return
        //
        //     // @ts-ignore
        //     var files = document.getElementById('fileToUpload').files;
        //     var file = files[0];
        //     var fileName = file.name;
        //     var url = "https://" + storageAccount + ".blob.core.windows.net/"+ storageName + "/" + fileName;
        //     var now = (new Date()).toUTCString();
        //
        //     var method = "PUT";
        //     var content = file;
        //     var contentLength = file.size;
        //
        //     var headerResource = "x-ms-blob-type:BlockBlob\nx-ms-date:"+ now;
        //
        //     for (let i = 0; i < otherTags.length; i++) {
        //         headerResource += "\nx-ms-meta-" + otherTags[i][0].toLowerCase() + ":" + otherTags[i][1];
        //     }
        //     headerResource += "\nx-ms-version:2019-07-07";
        //
        //
        //     var canonicalizedResource = "/" + storageAccount + "/" + storageName + "/"+fileName;
        //     var contentEncoding = "";
        //     var contentLanguage = "";
        //     var contentMd5 = "";
        //     var contentType = "application/x-www-form-urlencoded; charset=UTF-8";
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
        //     // $.ajax({
        //     //     type: method,
        //     //     data: content,
        //     //     beforeSend: function (request)
        //     //     {
        //     //         request.setRequestHeader("x-ms-blob-type", "BlockBlob");
        //     //         request.setRequestHeader("x-ms-date", now);
        //     //         request.setRequestHeader("x-ms-version", "2019-07-07");
        //     //         for (let i = 0; i < otherTags.length; i++) {
        //     //             request.setRequestHeader("x-ms-meta-" + otherTags[i][0], otherTags[i][1]);
        //     //         }
        //     //
        //     //
        //     //         request.setRequestHeader("Authorization", AuthorizationHeader);
        //     //     },
        //     //     url: url,
        //     //     processData: false,
        //     //     error: function(xhr, textStatus, errorThrown) {
        //     //         console.error(xhr.responseText);
        //     //     },
        //     //     success: function(data) {
        //     //         console.log("Success");
        //     //         alert(`File uploaded successfully.`);
        //     //         window.close();
        //     //     }
        //     // });
        // }
    }

    addTag = () => {
        this.tagIndex += 1;
        var tagTable = document.getElementById('tableForTags');
        // @ts-ignore
        tagTable.innerHTML += '<tr><td><input id="tagKey' + this.tagIndex + '" type="text" size="40"></td><td><input id="tagValue' + this.tagIndex + '" type="text" size="40"></td></tr>';

    }

    render() {
    return (
        <Jumbotron>
            <title>Upload file to cloud</title>
            <h1>Choose file for uploading to cloud</h1>
            <div>
                <input type="file" id="fileToUpload"/>
            </div>
            <select id="cloudCombobox" name="Cloud">
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
            </select>

            <div className="tagsDiv">
                <table id="tableForTags" className="tagsTable">
                    <tr>
                        <td>Key</td>
                        <td>Value</td>
                    </tr>
                    <tr>
                        <td><input value="uploadedby" id="defaultTagKey1" type="text" size={40} readOnly/></td>
                        <td><input id="defaultTagValue1" type="text" size={40}/></td>
                    </tr>
                    <tr>
                        <td><input value="ownedby" id="defaultTagKey2" type="text" size={40} readOnly/></td>
                        <td><input id="defaultTagValue2" type="text" size={40}/></td>
                    </tr>
                    <tr>
                        <td><input value="category" id="defaultTagKey3" type="text" size={40} readOnly/></td>
                        <td><input id="defaultTagValue3" type="text" size={40}/></td>
                    </tr>

                    <tr>
                        <td><input id="tagKey1" type="text" size={40}/></td>
                        <td><input id="tagValue1" type="text" size={40}/></td>
                    </tr>
                </table>
            </div>


            <button onClick={this.addTag}>Add Tag</button>


            <div>
                <Button onClick={this.uploadFile} variant="primary">Upload File</Button>
            </div>


        </Jumbotron>
        );
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(UploadFile);