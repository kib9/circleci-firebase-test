const serviceAccount = require("./firebaseAdminSDK.json");
const { google } = require('googleapis');
const rp = require('request-promise');
const projectId = serviceAccount.project_id

async function getAccessToken(){
    const scopes = [
      'https://www.googleapis.com/auth/datastore', 
      'https://www.googleapis.com/auth/cloud-platform'
    ];
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        undefined,
        serviceAccount.private_key,
        scopes,
        undefined
    );
    try{
        const authorization = await jwtClient.authorize();
        return authorization.access_token;
    }catch(err){
        return err;
    }
}

async function backupFirestore(){
    try{
        const accessToken = await getAccessToken();
        // console.log(accessToken)
        const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;
        // console.log(endpoint)
        const option = {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            json: true,
            body: {
                outputUriPrefix: `gs://${projectId}-firestore-backup`,
            }
        };
        const res = await rp.post(endpoint, option);
        return res.data;
    }catch(err){
        console.error(`error occurred when doing backup: ${err}`);
        return err;
    }
}

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.FirestoreBackup = async(event, context) => {
  try{
    // backup firestore data
    const res = await backupFirestore();
    console.log(`firestore backup job is successfully registered: ${res}`);
    return res;
  }catch(err){
    console.error(`error occurred when backuping: ${err}`);
    return err;
  }
};

/**
 * FirestoreBackup テスト
 */
FirestoreBackupTest = async() => {
  try{
    // backup firestore data
    const res = await backupFirestore();
    console.log(`firestore backup job is successfully registered: ${res}`);
    return res;
  }catch(err){
    console.error(`error occurred when backuping: ${err}`);
    return err;
  }
};
// res = FirestoreBackupTest();
