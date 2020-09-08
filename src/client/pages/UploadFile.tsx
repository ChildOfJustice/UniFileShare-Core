import Jumbotron from "react-bootstrap/Jumbotron";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import * as React from "react";
import * as AWS from "aws-sdk"
import * as CryptoJS from "crypto-js"

///CONFIG
var bucketName = "sardor-test-app";
var bucketRegion = "eu-central-1";
var IdentityPoolId = "eu-central-1:25ea5b9f-3216-43fb-94a7-ae0d049e62e8";
var storageAccount = "aypocdat103storageay";
var storageName = "ay-poc-dat103-blob";
var storageKey = "VnaFQwxjBwudePxhrPGWKEm7Trb2TLl8/ElQvTyPd0K46CVo6oOpC98w4+ZNzQnNeN1fGR4krlLynKgipc631Q==";
//^


// eslint-disable-next-line react/display-name,@typescript-eslint/explicit-module-boundary-types
export default class UploadFile extends React.Component {

    tagIndex = 1;


    downloadFile = (fileName:string, cloud:string) => {
        if (cloud == 'AWS'){

            AWS.config.update({
                region: bucketRegion,
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: IdentityPoolId
                })
            });

            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: bucketName}
            });

            var promise = s3.getSignedUrlPromise('getObject', {
                Bucket: bucketName,
                Key: fileName
            });
            promise.then(function(url) {
                window.open( url, '_blank' );
                console.log('The URL is', url);
            }, function(err) { alert("error") });


        }

        if(cloud == 'Azure'){

            var url = "https://"+storageAccount+".blob.core.windows.net/"+storageName+"/" + fileName;
            var now = (new Date()).toUTCString();

            var method = "GET";
            var headerResource = "x-ms-date:"+ now + "\nx-ms-version:2019-07-07";
            var canonicalizedResource = "/" + storageAccount + "/"+storageName+"/"+fileName;
            var contentEncoding = "";
            var contentLanguage = "";
            var contentLength = "";
            var contentMd5 = "";
            var contentType = "";
            var date = "";
            var ifModifiedSince = "";
            var ifMatch = "";
            var ifNoneMatch = "";
            var ifUnmodifiedSince = "";
            var range = "";
            var stringToSign = method + "\n" + contentEncoding + "\n" + contentLanguage + "\n" + contentLength + "\n" + contentMd5 + "\n" + contentType + "\n" + date + "\n" + ifModifiedSince + "\n" + ifMatch + "\n" + ifNoneMatch + "\n" + ifUnmodifiedSince + "\n" + range + "\n" + headerResource + "\n" + canonicalizedResource;

            console.log("StringToSign: " + stringToSign);

            var secret = CryptoJS.enc.Base64.parse(storageKey);
            var hash = CryptoJS.HmacSHA256(stringToSign, secret);
            var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
            var signature = hashInBase64;


            var AuthorizationHeader = "SharedKey " + storageAccount + ":" + signature;


            var xhttp = new XMLHttpRequest();

            xhttp.addEventListener('load', function() {
                console.log(this.statusText);
                if(this.statusText == "OK"){
                    const urlBlob = window.URL.createObjectURL(this.response);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = urlBlob;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(urlBlob);
                    a.remove();
                } else {
                    alert(this.statusText);
                }
            });
            xhttp.addEventListener('error', () => console.log("Request to "+url+" failed"));

            xhttp.open("GET", url, true);
            xhttp.responseType = 'blob';
            xhttp.setRequestHeader("Cache-Control", "no-cache, must-revalidate, no-store");
            xhttp.setRequestHeader("Authorization", AuthorizationHeader);
            xhttp.setRequestHeader("x-ms-date", now);
            xhttp.setRequestHeader("x-ms-version", "2019-07-07");
            xhttp.send();

        }

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
        otherTags.push([defaultTagKey1, defaultTagValue1]);
        otherTags.push([defaultTagKey2, defaultTagValue2]);
        otherTags.push([defaultTagKey3, defaultTagValue3]);


        for (let i = 0; i < this.tagIndex; i++) {
            // @ts-ignore
            var element = [document.getElementById('tagKey'+(i+1)).value, document.getElementById('tagValue'+(i+1)).value];
            if(element[0] != ""){
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

            AWS.config.update({
                region: bucketRegion,
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: IdentityPoolId
                })
            });

            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: bucketName}
            });



            // @ts-ignore
            var files = document.getElementById('fileToUpload').files;
            var file = files[0];
            if(typeof file == "undefined" || typeof file.name == "undefined"){
                alert("Choose the file first");
            }

            const params = {
                Bucket: bucketName,
                Key: file.name,
                Body: file,
            };


            var canonicalTagArray = [];
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
        }
        if(itemValue == "Azure"){
            alert("This cloud provider is not supported for now")
            return

            // @ts-ignore
            var files = document.getElementById('fileToUpload').files;
            var file = files[0];
            var fileName = file.name;
            var url = "https://" + storageAccount + ".blob.core.windows.net/"+ storageName + "/" + fileName;
            var now = (new Date()).toUTCString();

            var method = "PUT";
            var content = file;
            var contentLength = file.size;

            var headerResource = "x-ms-blob-type:BlockBlob\nx-ms-date:"+ now;

            for (let i = 0; i < otherTags.length; i++) {
                headerResource += "\nx-ms-meta-" + otherTags[i][0].toLowerCase() + ":" + otherTags[i][1];
            }
            headerResource += "\nx-ms-version:2019-07-07";


            var canonicalizedResource = "/" + storageAccount + "/" + storageName + "/"+fileName;
            var contentEncoding = "";
            var contentLanguage = "";
            var contentMd5 = "";
            var contentType = "application/x-www-form-urlencoded; charset=UTF-8";
            var date = "";
            var ifModifiedSince = "";
            var ifMatch = "";
            var ifNoneMatch = "";
            var ifUnmodifiedSince = "";
            var range = "";
            var stringToSign = method + "\n" + contentEncoding + "\n" + contentLanguage + "\n" + contentLength + "\n" + contentMd5 + "\n" + contentType + "\n" + date + "\n" + ifModifiedSince + "\n" + ifMatch + "\n" + ifNoneMatch + "\n" + ifUnmodifiedSince + "\n" + range + "\n" + headerResource + "\n" + canonicalizedResource;

            console.log("StringToSign: " + stringToSign);

            var secret = CryptoJS.enc.Base64.parse(storageKey);
            var hash = CryptoJS.HmacSHA256(stringToSign, secret);
            var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
            var signature = hashInBase64;


            var AuthorizationHeader = "SharedKey " + storageAccount + ":" + signature;
            // $.ajax({
            //     type: method,
            //     data: content,
            //     beforeSend: function (request)
            //     {
            //         request.setRequestHeader("x-ms-blob-type", "BlockBlob");
            //         request.setRequestHeader("x-ms-date", now);
            //         request.setRequestHeader("x-ms-version", "2019-07-07");
            //         for (let i = 0; i < otherTags.length; i++) {
            //             request.setRequestHeader("x-ms-meta-" + otherTags[i][0], otherTags[i][1]);
            //         }
            //
            //
            //         request.setRequestHeader("Authorization", AuthorizationHeader);
            //     },
            //     url: url,
            //     processData: false,
            //     error: function(xhr, textStatus, errorThrown) {
            //         console.error(xhr.responseText);
            //     },
            //     success: function(data) {
            //         console.log("Success");
            //         alert(`File uploaded successfully.`);
            //         window.close();
            //     }
            // });
        }
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
                        <td><input value="createdby" id="defaultTagKey1" type="text" size={40} readOnly/></td>
                        <td><input value="AlisherCreator" id="defaultTagValue1" type="text" size={40}/></td>
                    </tr>
                    <tr>
                        <td><input value="ownedby" id="defaultTagKey2" type="text" size={40} readOnly/></td>
                        <td><input value="AlisherOwner" id="defaultTagValue2" type="text" size={40}/></td>
                    </tr>
                    <tr>
                        <td><input value="category" id="defaultTagKey3" type="text" size={40} readOnly/></td>
                        <td><input value="Category" id="defaultTagValue3" type="text" size={40}/></td>
                    </tr>

                    <tr>
                        <td><input id="tagKey1" type="text" size={40}/></td>
                        <td><input id="tagValue1" type="text" size={40}/></td>
                    </tr>
                </table>
            </div>


            <button onClick={this.addTag}>Add Tag</button>


            <div>
                <button onClick={this.uploadFile}>Submit</button>
            </div>


        </Jumbotron>
        );
    }
}