
"use strict";
// Strings
const S3_NOT_INIT_TEXT = 'please initialize s3 credentials on the settings page'
const IAM_TEXT = 'iam'
const COGNITOPOOL_TEXT = 'cognitopool'


// Global Data
let SETTING_CREDENTIALS = {
  bucketName: '',
  region: '',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
    expiration: null,
    sessionToken: null
  },
  poolId: ''
}
// window.s3CredentialsStatus = NOT_INIT_STATUS
// window.whichCredential = ''

/** helper functions **/
const getElementById = (elementId) => {
  return document.getElementById(elementId)
}

// loadCredentials is only called on the dashboard page
const loadCredentials = async () => {
  const settingCredentials = localStorage.getItem('settingCredentials')
  if (!settingCredentials) return 

  SETTING_CREDENTIALS = JSON.parse(settingCredentials)
  if (!SETTING_CREDENTIALS.region || !SETTING_CREDENTIALS.bucketName) return

  if (!whichCredential) {
    try {
      await aws_init(
        SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
        SETTING_CREDENTIALS.bucketName,
        {iamCredentials: SETTING_CREDENTIALS.credentials})

    } catch (error) {
      throw error
    }
    return;
  }
  switch (whichCredential) {
    case IAM_TEXT:
      try {
        await aws_init(
          SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
          SETTING_CREDENTIALS.bucketName,
          {iamCredentials: SETTING_CREDENTIALS.credentials})
  
      } catch (error) {
        throw error
      }
      return;
    case COGNITOPOOL_TEXT:
      try {
        await aws_init(
          SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
          SETTING_CREDENTIALS.bucketName,
          {withPoolId:true, poolID: SETTING_CREDENTIALS.poolId})
  
      } catch (error) {
        throw error
      }
      return;
    default:
      try {
        await aws_init(
          SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
          SETTING_CREDENTIALS.bucketName,
          {iamCredentials: SETTING_CREDENTIALS.credentials})
  
      } catch (error) {
        throw error
      }
      return;
  }
}

const checkesInitStatus = ({isSettingsPage=false, showFlash=false}) => {
  statusElement(
    whichCredential, s3Connected, 
    {isSettingsPage, showFlash})
}
/*** End of helpsers */

/***  init aws s3 */
const initWithIAM = async () => {
  let inputBucketName = getElementById('inputIAMBucketName')
  let inputRegion = getElementById('inputIAMRegion')
  let inputAccessKey = getElementById('inputIAMAccessKey')
  let inputSecretKey = getElementById('inputIAMSecretKey')

  if (!inputBucketName.value || 
    !inputRegion.value || 
    !inputAccessKey.value ||
    !inputSecretKey.value
  ) return showFlashMessage('1 or more fields are missing')

  if (!inputBucketName.value.trim() || 
    !inputRegion.value.trim() || 
    !inputAccessKey.value.trim() ||
    !inputSecretKey.value.trim()
  ) return showFlashMessage('1 or more fields are missing')

  const credentials = {
    accessKeyId: inputAccessKey.value.trim(),
    secretAccessKey: inputSecretKey.value.trim(),
    expiration: null,
    sessionToken: null
  }

  SETTING_CREDENTIALS = {
    bucketName: inputBucketName.value.trim(),
    region: inputRegion.value.trim(),
    credentials,
    poolId: SETTING_CREDENTIALS.poolId
  }
 
  try {
    await aws_init(
      SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
      SETTING_CREDENTIALS.bucketName,
      {iamCredentials: SETTING_CREDENTIALS.credentials})

      checkesInitStatus({ isSettingsPage: true, showFlash: true })
  } catch (error) {
    console.log(error)
    checkesInitStatus({ isSettingsPage: true, showFlash: true })
  }
}

const initWithPool = async () => {
  const inputBucketName = getElementById('inputPoolBucketName')
  const inputRegion = getElementById('inputPoolRegion')
  const inputPoolID = getElementById('inputPoolID')

  if (!inputBucketName.value || 
    !inputRegion.value || 
    !inputPoolID.value
  ) return showFlashMessage('1 or more fields are missing')

  if (!inputBucketName.value.trim() || 
    !inputRegion.value.trim() || 
    !inputPoolID.value.trim()
  ) return showFlashMessage('1 or more fields are missing')

  SETTING_CREDENTIALS = {
    bucketName: inputBucketName.value.trim(),
    region: inputRegion.value.trim(),
    credentials: SETTING_CREDENTIALS.credentials,
    poolId: inputPoolID.value.trim()
  }

  try {
    await aws_init(
      SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
      SETTING_CREDENTIALS.bucketName,
      {withPoolId:true, poolID: SETTING_CREDENTIALS.poolId})
    checkesInitStatus({ isSettingsPage: true, showFlash: true })
  } catch (error) {
    checkesInitStatus({ isSettingsPage: true, showFlash: true })
    console.log(error)
  }
}
/***  End of initialization */

/** UI maipulations */

const showFlashMessage = (message) => {
  const flashMessageEle = getElementById('flashcard-wrapper')

  flashMessageEle.style.display = 'block'
  flashMessageEle.innerHTML = `<center><p>${message}</p></center>`

  setTimeout(() => {
    flashMessageEle.innerHTML = ''
    flashMessageEle.style.display = 'none'
  }, 3000)
}

const statusElement = (
  credentialType, s3IsConnected, 
  {isSettingsPage=false, showFlash=false} = {}
) => {
  const statusElement = getElementById(`check-${credentialType}-credentials`)

  if (!s3IsConnected) {
    if (showFlash) showFlashMessage('Failed to initialize')
    if (isSettingsPage) {
      statusElement.innerHTML = `
        <button type="button" class="btn btn-danger">Failed To Initialize</button>
     `
      const credentialTypeText = credentialType === IAM_TEXT ? COGNITOPOOL_TEXT : IAM_TEXT
      removeStatusElement(credentialTypeText)
    }
    return
  }

  if (showFlash) showFlashMessage('Successfully initialized')
  if (isSettingsPage) {
    statusElement.innerHTML = `
      <button type="button" class="btn btn-success">Initialize Successful <i class="ml-2 fa fa-gear"></i></button>
    `
    const credentialTypeText = credentialType === IAM_TEXT ? COGNITOPOOL_TEXT : IAM_TEXT
    removeStatusElement(credentialTypeText)
  }
}

const removeStatusElement = (credentialType) => {
  const statusElement = getElementById(`check-${credentialType}-credentials`)
  statusElement.innerHTML = ''
}

/// save credentials to localstorage
const saveIAMCredentials = () => {
  // initialises S3 client with IAM credentials if S3 is not cennected using IAM credentials
  if (!s3Connected || whichCredential === COGNITOPOOL_TEXT) {
    initWithIAM()
  }
  localStorage.setItem('settingCredentials', JSON.stringify(SETTING_CREDENTIALS))
  setSetting({isIAMDisabled: true, showIAM: true})
  showFlashMessage("credentials were successfully saved")
}

const savePoolCredentials = () => {
  // initialises S3 client with Cognito pool credentials if S3 is not cennected using Cognito pool credentials
  if (!s3Connected || whichCredential === IAM_TEXT) {
    initWithPool()
  }

  localStorage.setItem('settingCredentials', JSON.stringify(SETTING_CREDENTIALS))
  setSetting({isIAMDisabled: true, showIAM: false})
  showFlashMessage("credentials were successfully saved")
}

/// setting up credentials for both IAM and Cognito Pool
const editIAMCredentials = () => {
  setSetting({isIAMDisabled: false, showIAM: true}) // to show the Iam pannel
}

const editPoolCredentials = () => {
  setSetting({isPoolDisabled: false, showIAM: false}) // to show the Pool pannel
}

/// sets the full credentials to show up in the text fields
const setIAMSettingCredentials = () => {
  const inputBucketName = getElementById('inputIAMBucketName')
  const inputRegion = getElementById('inputIAMRegion')
  const inputAccessKey = getElementById('inputIAMAccessKey')
  const inputSecretKey = getElementById('inputIAMSecretKey')

  inputRegion.value = SETTING_CREDENTIALS.region
  inputBucketName.value = SETTING_CREDENTIALS.bucketName
  inputAccessKey.value = SETTING_CREDENTIALS.credentials.accessKeyId
  inputSecretKey.value = SETTING_CREDENTIALS.credentials.secretAccessKey
}

/// sets the full credentials to show up in the text fields
const setPoolSettingCredentials = () => {
  const inputBucketName = getElementById('inputPoolBucketName')
  const inputRegion = getElementById('inputPoolRegion')
  const inputPoolID = getElementById('inputPoolID')

  inputRegion.value = SETTING_CREDENTIALS.region
  inputBucketName.value = SETTING_CREDENTIALS.bucketName
  inputPoolID.value = SETTING_CREDENTIALS.poolId
}
/** End of UI maipulations */

/**** AWS S3 CRUD Operations */
// list objects (Reading)
const listObjects = async () => {
  const objectListElement = getElementById("object-list")

  if (!s3Connected) {
    const htmlTemplate = `
    <p class='center'>
      <i class="fa fa-warning"></i> ${S3_NOT_INIT_TEXT}
    </p>
    `;
    objectListElement.innerHTML = htmlTemplate;
    return
  } 

  try {
    const data = await s3.send(
      new ListObjectsCommand({ Delimiter: '/', Bucket: bucketName,  })
    );

    if (!data.Contents || data.Contents.length === 0) {
      const htmlTemplate = `
      <p class='center'>
        You do not have any object in this S3 bucket. Start adding objects to your S3 bucket by clicking the add button
      </p>`;
      objectListElement.innerHTML = htmlTemplate;
    } else {
      data.Contents.map((content) => {
        // const prefix = commonPrefix.Prefix;
        // const objectName = decodeURIComponent(prefix.replace("/", ""));
        const li = document.createElement('li')
        li.innerHTML = `
          <div><span>${content.Key}</span></div>
          <div class="todo-actions">
            <a class="todo-remove" onpointerup="deleteObject('${content.Key}')">
              <button class="btn btn-danger" style="color: white"><i class="fa fa-times" ></i> Delete</button>
            </a>
          </div>
          `;
          objectListElement.appendChild(li)
        });
      }
    } catch (err) {
      const htmlTemplate = `
      <p class='center'>
        <i class="fa fa-warning"></i> There was an error listing your objects: ${err.message}
      </p>
      `;
      objectListElement.innerHTML = htmlTemplate;
      showFlashMessage();
    }
  };
  
  // Add an object to an bucket (create)
  const addObject = async () => {
    if (!s3Connected) 
      return showFlashMessage(S3_NOT_INIT_TEXT)

    const files = document.getElementById("objectInput").files;
    try {
      const file = files[0];
      const fileName = file.name;
      const objectKey = fileName;
      const uploadParams = {
        Bucket: bucketName,
        Key: objectKey,
        Body: file
      };
      try {
        await s3.send(new PutObjectCommand(uploadParams));
        showFlashMessage(`Successfully uploaded ${fileName}.`);
        setDashboard()
      } catch (err) {
        return showFlashMessage("There was an error uploading your file object: ", err.message);
      }
    } catch (err) {
      if (!files.length) {
        return showFlashMessage("Choose a file to upload first.");
      }
    }
  };
  
  // Delete an object from the bucket (delete)
  const deleteObject = async (objectKey) => {
    if (!s3Connected) return showFlashMessage(S3_NOT_INIT_TEXT)
      try {
        const params = {
          Bucket: bucketName,
          Key: objectKey,
          Quiet: true,
        };
        await s3.send(new DeleteObjectCommand(params));
        setDashboard();
        return showFlashMessage(`Successfully deleted ${objectKey}.`);
      } catch (err) {
        return showFlashMessage(`There was an error deleting ${objectKey}: ${err.message}`);
      }
  };
