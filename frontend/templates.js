const appElement = document.getElementById('app')

const pageIndexes = {
    dashboard: 0,
    addShop: 1,
    setup: 2,
    help: 3
}

const getHTMLTemplate = (templateName, content) => {
    const templateHeader = `
    <header class="page-header">
        <h2>${templateName}</h2>
    </header>
    `
    const templateContent = `
        <div class="row">
            <div class="col-12">
                <section class="panel panel-transparent">
                    <div class="panel-body">
                        <section class="panel panel-group">
                            <div id="accordion">
                                <div class="panel panel-accordion panel-accordion-first">
                                    ${content}
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    `
    const template = [
        templateHeader,
        templateContent
    ]

    return template.join('')
}

const getCollapseContent = ({contentHTML='', actions=[], contentName='', contentID='', collapse='in'} = {}) => {
    return `
        <div class="panel-heading row-lg-12">
            <h4 class="panel-title">
                <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#${contentID}">
                    <i class="fa fa-angle-down"></i> ${contentName} <i id="check-${contentID}-credentials"></i>
                </a>
            </h4>
            
        </div>
        <div id="${contentID}" class="accordion-body collapse ${collapse}">
            <div class="panel-body">
                ${contentHTML}
             
                <div class="row-sm-12 center">
                    ${actions.length > 0 ? '<hr class="solid mt-sm mb-lg">' : ''}
                    ${actions.map(action => (`
                        <button type="button" class="btn btn-${action.type}" ${action.method}>${action.name}</button>
                    `)).join('')}
                </div>
            </div>
        </div>
    `
}

const setLiActive = (index) => {
    const liList = document.querySelectorAll('.nav-main li')

    liList.forEach((node, ind) => {
        if (ind === index) {
            node.classList.add('nav-active')
        } else {
            node.classList.remove('nav-active')
        }
    })

}

const setDashboard = async () => {
    setLiActive(pageIndexes.dashboard)
    const contentHTML = `
        <ul class="widget-todo-list" id="object-list" onload="listObjects()"></ul>
    `
    const actions = [
        // {name: 'Add Object', method:`onpointerup="setNewObject()"`, type: 'primary' }
]
    const content = getCollapseContent({ contentHTML, actions, contentName:'Objects', contentID:'objects'})

    const template = `
        <header class="page-header">
            <h2>Coffee Shops</h2>
        </header>
        <div class="row">
            <div class="col-12">
                <section class="panel panel-transparent">
                    <div class="panel-body">
                        <section class="panel panel-group">
                            <div id="accordion">
                                <div class="panel panel-accordion panel-accordion-first">
                                    ${content}
                                </div>
                                <button> Setup </button>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    `
    
    
    // getHTMLTemplate(
    //     'Dashboard', 
    //     content, 
    // )

    appElement.innerHTML = template
    loadCredentials()
    .then(() => {
        listObjects()
    })
    .catch(e => {
        listObjects()
        console.log(e.message)
    })

}

const setSetting = ({isIAMDisabled=true, isPoolDisabled=true, showIAM=true} = {}) => {
    setLiActive(pageIndexes.setup)

    let IAMcontentHTML = `
    <p class="center"><i class="fa fa-warning"></i> Follow instructions on help page before initializing</p>
    <form class="form-horizontal form-bordered" method="get">
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMRegion">Region</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="inputIAMRegion">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMAccessKey">Access Key</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="inputIAMAccessKey">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMSecretKey">Secret Key</label>
            <div class="col-md-6">
                <input type="text" class="secureInput form-control" id="inputIAMSecretKey">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMBucketName">Role ARN</label>
            <div class="col-md-6">
                <input type="text" minLength='3' class="form-control" id="inputIAMBucketName">
            </div>
        </div>
    </form>
    `

    const actionsIAM = [
        // {
        //     name: 'Save Credentials', 
        //     method:`onpointerup="saveIAMCredentials()" ${isIAMDisabled ? 'disabled' : ''}`,
        //     type: 'success'
        // },
        // {
        //     name: 'Initialize Credentials', 
        //     method:`onpointerup="initWithIAM()"`,
        //     type: 'warning'
        // },
        {
            name: `SETUP  <i class="fa fa-gear"></i>`, 
            method:`onpointerup="editIAMCredentials()"`,
            type: 'primary'
        }
    ]

    const IAMContent = getCollapseContent({
        contentHTML: IAMcontentHTML, 
        actions: actionsIAM, 
        contentName: 'Credentials', 
        contentID:'iam', 
        collapse: showIAM? 'in': ''
    })
    const content = IAMContent 
    const template = getHTMLTemplate(
        'setup', 
        content,
    )

    appElement.innerHTML = template

    // setIAMSettingCredentials()
    // setPoolSettingCredentials()

    // checkesInitStatus({ issetupPage: true, showFlash: false })
}


const setNewObject = () => {
    setLiActive(pageIndexes.addShop)
    const contentHTML = `
    <form class="form-horizontal form-bordered" method="get">
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMSecretKey">Store Name</label>
            <div class="col-md-6">
                <input type="text" class="secureInput form-control" id="inputIAMSecretKey">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMSecretKey">Store Rating</label>
            <div class="col-md-6">
                <input type="text" class="secureInput form-control" id="inputIAMSecretKey">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMSecretKey">Store Image (optional)</label>
            <div class="col-md-6">
                <input type="text" class="secureInput form-control" id="inputIAMSecretKey">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMSecretKey">Comment</label>
            <div class="col-md-6">
                <input type="text" class="secureInput form-control" id="inputIAMSecretKey">
            </div>
        </div>
    </form>
    `
    const actions = [{name: 'Add New Coffee Shop', method:`onpointerup="addObject()"`, type: 'primary' }]
    const content = getCollapseContent({
        contentHTML, 
        actions, 
        contentName: 'New Shop', 
        contentID: 'newshops'
    })

    const template = getHTMLTemplate(
        'Add Shops', 
        content, 
    )

    appElement.innerHTML = template
}

const prereqSteps = [
    '<b>Step 1:</b> Copy the code below (on this page) then open your S3 bucket page',
    '<b>Step 2:</b> Click on the "Permissions" tab',
    '<b>Step 3:</b> Scroll down until you find the card with title, Cross-origin resource sharing (CORS)',
    '<b>Step 4:</b> Click on the "Edit" button',
    '<b>Step 5:</b> Paste the code from Step1 into the edit box',
    '<b>Step 6:</b> Click on "Save changes"',
    '<b>Step 7:</b> On this page(s3.html), Click on "Setting" on the left', 
    '<b>Step 8:</b> Enter your s3 bucket IAM credentials and other information in the IAM Credentials form'
]

const access_secret_key_Steps = [
    '<b>Step 1:</b> Sign in to the AWS Management Console and open the IAM console at <a href="https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/users" target="_blank"',
    '<b>Step 2:</b> Click on the "Add users" button',
    '<b>Step 3:</b> Type the user name for the new user.',
    '<b>Step 4:</b> Select "Access key - Programmatic access" for the AWS credential type',
    '<b>Step 5:</b> Click "Next: Permissions" button',
    '<b>Step 6:</b> Click on "Attach existing policies directly"',
    '<b>Step 7:</b> Choose "Use a permissions boundary to control the maximum user permissions" option', 
    '<b>Step 8:</b> Under Policy name, Select "AdministratorAccess"',
    '<b>Step 5:</b> Click "Next: Tags" button',
    '<b>Step 5:</b> Click "Next: Review" button',
]


const initErrorCauses = [
    '<b>You do not have an internet connection. Make sure you can navigate to other websites',
    'Your secret or access keys are incorrect or your pool ID is incorrect. Make sure that your credentials are correct. It is recommended to copy and paste them to avoid mistakes.',
    'Your IAM user or Cognito Identity Pool is not active. Make sure that the IAM user exist and your identity pool is active. You can check these in the aws console.',
    'You do not have Core Policy that enables all CRUD operations to your bucket. Make sure you have followed the instructions under Prerequisite.',
    '* If you keep seeing (please initialize s3 credentials on the setup page) on the dashboard even after you click on "Initialize Credentials" button; <u>You need to click "Save Credentials"</u> first so that the app can recognise the new credentials.<b>',
    'For any other issues not lister, please create an issue on the github page for the project. Thanks :)</b>'
]

const cognitoHelpSteps = [
    '<b>Step 1:</b> Login to AWS.',
    '<b>Step 2:</b> Click Services.',
    '<b>Step 3:</b> Search for Cognito.',
    '<b>Step 4:</b> Click Cognito.',
    '<b>Step 5:</b> Click Manage Identity Pools.',
    '<b>Step 6:</b> Click on the name of the Identity Pool you would like the IdentityPoolId of.',
    '<b>Step 7:</b> Click on Sample code.',
    '<b>Step 8:</b> Copy the only text in red (that is your pool id) without the quotations.',
    '<b>Step 9:</b> On this page(s3.html), Click on "Setting" on the left',
    '<b>Step 10:</b> Paste the pool ID you just copied in Step 8 in the Pool ID text field under Cognito Pool Credentials form'
]

const jsonFormat = [
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "GET",
            "DELETE"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]

const setHelp = async () => {
    setLiActive(pageIndexes.help)

    const contentPrereqHTML = `
        <p><b> Follow These steps to get your credentials</b> </p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${prereqSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
        <hr class="solid mt-sm mb-lg">
        <h5>Code</h5>
        <pre>${JSON.stringify(jsonFormat, null, 4)}</pre>
    `
    const contentIAMHTML = `
        <p>To use IAM Credentials Initialization, you must first create IAM user.</p>
        <p>Follow the instructions to create IAM user <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html" target="__blank">here</a>.</p>
        <p>Your Access and Secret key will be shown to you when IAM user is created. Make sure to copy and paste them in the appropriate text file under IAM Credentials Form</p>
    `
    const contentPoolHTML = `
        <p>To use Cognito Credentials, you must first create a cognito user pool.</p>
        <p>Follow the instructions to create a user pool <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html" target="__blank">here</a>.</p>
        <p>To find your pool ID, follow these steps</p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${cognitoHelpSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `
    const contentFailedToInitHTML = `
        <p>Here are some of the issues that can cause [Failed to Initialized] Errors or the dashboard still says you need initialize even though you already did.</p>
        <ul class="widget-todo-list " id="object-list" onload="listObjects()">
            ${initErrorCauses.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `
    const actions = []
    const contentPrerequisite = getCollapseContent({ 
        contentHTML: contentPrereqHTML, 
        actions,
        contentName:'Prerequisite - Do this before initializing credentials on the setup Page', 
        contentID:'prereq',
        collapse: ''
    })
    const contentIAM = getCollapseContent({ 
        contentHTML: contentIAMHTML, 
        actions,
        contentName:'How To Get IAM Access Key and Secret Key', 
        contentID:'helpIam',
        collapse: ''
    })
    const contentPool = getCollapseContent({ 
        contentHTML: contentPoolHTML, 
        actions,
        contentName:'How To Get Cognito Identity Pool ID', 
        contentID:'helpPool',
        collapse: ''
    })
    const contentFailedToInit = getCollapseContent({ 
        contentHTML: contentFailedToInitHTML, 
        actions,
        contentName:'Failed To Initialize Causes', 
        contentID:'failedtoinit',
        collapse: ''
    })
    const content = contentPrerequisite + "<br>" + contentIAM + "<br>" + contentPool + "<br>" + contentFailedToInit

    const template = getHTMLTemplate(
        'Help', 
        content, 
    )

    appElement.innerHTML = template
}


window.onload = setHelp

{/* <div class="form-group">
<label class="col-md-3 control-label">Select File</label>
<div class="col-md-6">
    <div class="fileupload fileupload-new" data-provides="fileupload">
        <div class="input-append">
            <div class="uneditable-input">
                <i class="fa fa-file fileupload-exists"></i>
                <span class="fileupload-preview"></span>
            </div>
            <span class="btn btn-default btn-file">
                <span class="fileupload-exists">Change</span>
                <span class="fileupload-new">Select file</span>
                <input type="file" id="objectInput" />
            </span>
            <a href="#" class="btn btn-default fileupload-exists" data-dismiss="fileupload">Remove</a>
        </div>
    </div>
</div>
</div> */}