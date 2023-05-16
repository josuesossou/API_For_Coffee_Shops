const appElement = document.getElementById('app')

const pageIndexes = {
    dashboard: 0,
    addShop: 1,
    setup: 2,
    curlCmd: 3,
    help: 4
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
                        <button 
                            id="${action.id || ''}"
                            type="button" 
                            class="btn btn-${action.type}" 
                            ${action.disabled? action.disabled : ''} 
                            ${action.method}
                        >
                            ${action.name}
                        </button>
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

//=================================GET COFFE SHOP PAGE============================================================//
const setDashboard = async () => {
    setLiActive(pageIndexes.dashboard)

    const isInited = JSON.parse(sessionStorage.getItem('isInited')) || false
    const isSetup = JSON.parse(sessionStorage.getItem('isSetup')) || false

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
                                
                                ${isInited && isSetup? 
                                    `
                                        <button onpointerup="getShopsAndDisplay()">refresh</button>
                                        <div style="margin: .5em 0"><b>It will take up to 7 seconds for newly added shops to show up</b></div>
                                        <div id="coffee-shops"></div>
                                    ` : `
                                        <button class="btn btn-primary" onpointerup="setSetting()">
                                            Go to Settings To Set Up Resources 
                                        </button>
                                    `
                                }
                                
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    `

    appElement.innerHTML = template
}

const getShopsAndDisplay = () => {
    const isInited = JSON.parse(sessionStorage.getItem('isInited'))

    if (isInited) {
        const coffeeShopsWrapper = getElementById('coffee-shops')

        getCoffeeShops().then(items => {
            console.log('items4', items)
            
            let innerHTML = ''

            for (const item of items) {
                const shop = JSON.parse(item.StoreData.S)
                const shopId = item.StoreID.S
                const contentHTML = `
                    <div style="display: flex; flex-direction: row">
                        <img src="${shop.storeImage}" width="150px">
                        <div style="margin-left: 2em; font-size: 1.1em">
                            <p>Comment: ${shop.storeComment} </p>
                            <p>Rating <b> ${shop.storeRating} </b> </p>
                        </div>
                    </div>
                `
                const content = getCollapseContent({ contentHTML, actions: [], contentName: shop.storeName, contentID: shopId})
                innerHTML += `<div class="panel panel-accordion panel-accordion-first">
                    ${content}
                </div>`
            }

            coffeeShopsWrapper.innerHTML = innerHTML
        })
    }
}

//==========================================SETTINGS PAGE===================================================//
const setSetting = () => {
    setLiActive(pageIndexes.setup)
    const isInited = JSON.parse(sessionStorage.getItem('isInited')) || false
    const setupData = JSON.parse(sessionStorage.getItem('setupData'))
    const isSetup = JSON.parse(sessionStorage.getItem('isSetup')) || false

    let IAMcontentHTML = isInited && setupData? (`
        <div class="col-sm-12" style="margin-bottom: 3em">
            <div class="col-sm-6" style="position: relative; left: 50%; transform: translateX(-50%)">
                ${isInited && isSetup ? '<b><div class="center" style="color: green">Setup Was Successful!</div></b>' : ''}
                ${setupData.map(data => {
                    return (`
                        <div class="" style="margin: 1em">
                            <i class="fa fa-check-circle" style="color: ${data.status === 200 ? 'green': 'red'}; font-size: 1.8em; margin-right: 1em"></i>
                            <span style="font-size: 1.8em">${data.msg}</span>
                        </div>
                        <hr>
                    `)
                }).join('')} 
                ${isInited && setupData && !isSetup ? '<p>Please wait for <span id="wait-timer"></span> to try again</p>' : ''}
            </div>
        </div>
    `)
    :
    `
        <p class="center"><i class="fa fa-warning"></i> Follow instructions on help page before Setup</p>
        <form class="form-horizontal form-bordered" method="get">
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
                <label class="col-md-3 control-label" for="inputIAMRegion">Region</label>
                <div class="col-md-6">
                    <input type="text" class="form-control" id="inputIAMRegion" placeholder="us-east-1">
                </div>
            </div>
        </form>
    `

    const actions = isInited && isSetup ? [
        {
            name: 'Tear Down Environment',
            type: 'danger',
            method: 'onpointerup="confirmDeletingServices()"',
            disabled: ''
        }

    ] : isInited && setupData ? [
        {
            id: 'try-again',
            name: 'Try Again',
            method: 'onpointerup="tryAgain()"',
            type: 'warning',
            disabled: 'disabled'
        },
        {
            id: 'delete-try-again',
            name: 'Clean Environment and Try Again',
            method: 'onpointerup="deleteAndTryAgain()"',
            type: 'danger',
            disabled: 'disabled'
        }
    ] : [
        {
            id: 'setup-btn',
            name: `SETUP
            <div id="setup-gear-icon" class="hide-gear-icon">
                <i class="fa fa-gear"  ></i>
            </div>`, 
            method:`onpointerup="setUp()"`,
            type: 'primary',
            disabled: isInited && isSetup? 'disabled':''
        }
    ] 

    const IAMContent = getCollapseContent({
        contentHTML: IAMcontentHTML, 
        actions, 
        contentName: 'Credentials', 
        contentID:'iam', 
        collapse: 'in'
    })
    const content = IAMContent 
    const template = getHTMLTemplate(
        'Setup', 
        content,
    )

    appElement.innerHTML = template
    
    if (isInited && setupData && !isSetup) {
        waitTimetryAgain(5)
    } 

    setPreviousCredentials()
}

//=====================================ADD NEW SHOP PAGE========================================================//
const setNewObject = () => {
    setLiActive(pageIndexes.addShop)

    const isSetup = JSON.parse(sessionStorage.getItem('isSetup')) || false

    const contentHTML = `
    <form class="form-horizontal form-bordered" method="get">
        <div class="form-group">
            <label class="col-md-3 control-label" for="storename">Store Name</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="storename">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="storerating">Store Rating</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="storerating">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="storeimage">Store Image (optional)</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="storeimage">
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="comment">Comment</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="comment">
            </div>
        </div>
    </form>
    `
    const actions = isSetup? [
        {
            name: 'Add New Coffee Shop',
            method:`onpointerup="addCoffeeShop()"`, 
            type: 'primary',
        }
    ] : [
        {
            name: 'Please ',
            method:`onpointerup="addCoffeeShop()"`, 
            type: 'primary',
        }
    ]
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

//=====================================Helper Page========================================================//
//// Help Page helpers
const prereqSteps = [
    '<b>Step 1:</b> Follow "Get Access and Screte Key" instructions',
    '<b>Step 2:</b> Follow "Create Policy" instructions',
    '<b>Step 3:</b> Follow "Get Region" instructions',
]

const access_secret_key_Steps = [
    '<b>Step 1:</b> Sign in to the AWS Management Console and open the IAM console at <a href="https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/users" target="_blank">https://console.aws.amazon.com/iam/users</a>',
    '<b>Step 2:</b> Click on the "Add users" button',
    '<b>Step 3:</b> Type the user name for the new user',
    '<b>Step 4:</b> Click "Next" button',
    '<b>Step 5:</b> Click "Next" button',
    '<b>Step 6:</b> Click on "Create user"',
    '<b>Step 7:</b> Follow the instructions for Creating a Policy then come back for step 8',
    '===== Continue After Creating a Policy ========', 
    '<b>Step 8:</b> Click on "Users"',
    '<b>Step 9:</b> Click on the User you have just created',
    '<b>Step 10:</b> In the tab navigation, select "Security credentials"',
    '<b>Step 11:</b> Scroll down until you see Access keys',
    '<b>Step 12</b> Click on "Create access key" button',
    '<b>Step 13</b> Select "Third-party service"',
    '<b>Step 14</b> Click the "I understand ..." checkbox',
    '<b>Step 15</b> Click "Next"',
    '<b>Step 16</b> Click "Create access key" button',
    '<b>Step 17:</b> Click on "Download .csv" button download the csv, save the file in a folder that you can remember.',
    '<b>Step 18</b> Click "Done"',
]

const initErrorCauses = [
    'need to complete',
]

const createPolicyHelpSteps = [
    '<b>Step 1:</b> Open the IAM console at <a href="https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/policies" target="_blank">https://console.aws.amazon.com/iam/policy</a>',
    '<b>Step 2:</b> Click on "Create policy" button.',
    '<b>Step 3:</b> Click on "JSON" tab.',
    '<b>Step 4:</b> Delete the code in the Policy editor box.',
    '<b>Step 5:</b> Copy the code below and paste it in the Policy editor box.',
    `<pre>{
        "Version": "2012-10-17",
        "Statement": [
            {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:ListTables",
                "dynamodb:CreateTable",
                "dynamodb:PutItem",
                "dynamodb:DeleteTable",
                "iam:GetRole",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:DeleteRole",
                "iam:DetachRolePolicy",
                "iam:PassRole",
                "lambda:GetFunction",
                "lambda:ListEventSourceMappings",
                "lambda:Create*",
                "lambda:Delete*",
                "s3:GetObject",
                "s3:CreateBucket",
                "s3:PutObject",
                "s3:Delete*",
                "sqs:GetQueueUrl",
                "sqs:DeleteQueue",
                "sqs:SendMessage",
                "sqs:CreateQueue"
            ],
            "Resource": "*"
            } 
        ]
    }</pre>
    `,
    '<b>Step 6:</b> Click on "Next" button.',
    '<b>Step 7:</b> Enter a policy name (this name can be anything as long as it is not being use by another policy), you can also add a description if you want to',
    '<b>Step 8:</b> Scroll down and Click on "Create Policy" button. The page should refresh and you should see the policies page',
    '<b>Step 9:</b> Find and Select the policy you have just created under "Policy Name" text.',
    '<b>Step 10:</b> Click on "Actions" button.',
    '<b>Step 11:</b> Click on "Attach" in the dropdown.',
    '<b>Step 12:</b> Select the IAM User you have just created.',
    '<b>Step 13:</b> Click "Attach policy" button.',
    '<b>Go back to the Get Access and Screte Key on the help page and follow step 8 to end</b>',
]

const regionHelpSteps = [
    '<b>Step 1:</b> Go to your dashboard in aws.',
    `<b>Step 2:</b> Click on menu botton next to your name on the top right. 
    This button usually have the text "Global". Click it even if it doesn't have that text.`,
    `<b>Step 3:</b> In the list that shows up, copy one of the texts that are on the right. 
    For example, us-east-1, us-east-2, or us-west-1 etc..`,
]

const setHelp = async () => {
    setLiActive(pageIndexes.help)

    const contentPrereqHTML = `
        <p><b> Follow These these instructions to get the required information to setup the application</b> </p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${prereqSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `
    const contentIAMHTML = `
        <p><b> Follow These these instructions to get your access key and secret key</b> </p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${access_secret_key_Steps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `
    const contentPolicyHTML = `
        <p><b> Follow These these instructions to create and add a policy to the user you have just created</b> </p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${createPolicyHelpSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `

    const contentRegionHTML = `
        <p><b> Follow These these instructions to get the region of your AWS account</b> </p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${regionHelpSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `

    const contentFailedToInitHTML = `
        <p><b>Here are some thing that can cause the setup to fail</b></p>
        <ul class="widget-todo-list " id="object-list" onload="listObjects()">
            ${initErrorCauses.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `
    const actions = []
    const contentPrerequisite = getCollapseContent({ 
        contentHTML: contentPrereqHTML, 
        actions,
        contentName:'Prerequisite - Do this before initializing credentials on the settings page', 
        contentID:'prereq',
        collapse: ''
    })
    const contentIAM = getCollapseContent({ 
        contentHTML: contentIAMHTML, 
        actions,
        contentName:'Get Access and Screte Key', 
        contentID:'helpIam',
        collapse: ''
    })
    const contentPolicy = getCollapseContent({ 
        contentHTML: contentPolicyHTML, 
        actions,
        contentName:'Create Policy', 
        contentID:'helpPolicy',
        collapse: ''
    })
    const contentRegion = getCollapseContent({ 
        contentHTML: contentRegionHTML, 
        actions,
        contentName:'Get Region', 
        contentID:'helpregion',
        collapse: ''
    })
    const contentFailedToInit = getCollapseContent({ 
        contentHTML: contentFailedToInitHTML, 
        actions,
        contentName:'Why Am I Getting An Error?', 
        contentID:'failedtoinit',
        collapse: ''
    })
    const content = contentPrerequisite + "<br>" + 
                    contentIAM + "<br>" + 
                    contentPolicy + "<br>" + 
                    contentRegion 
                    // contentFailedToInit

    const template = getHTMLTemplate(
        'Help', 
        content, 
    )

    appElement.innerHTML = template
}

//===================================Curl Command Page======================================================//
const setCurlCommand = async () => {
    setLiActive(pageIndexes.curlCmd)

    const contentPrereqHTML = `
        <p>Make sure you have curl <a href="https://curl.se/download.html" target="_blank">installed</a></p>
        <p>curl -d {} ${locationURL}/init</p>
        <p>curl -d {} ${locationURL}/setup</p>
    `
    const getCommandHTML = `
        <span id="getCommand">curl ${locationURL}/get-shops</span>
        <p>Copy the command and paste it in a terminal or command prompt</p>
    `
    const addShopCommandHTML = `
        <p>curl -d &lt;YOUR DATA&gt; ${locationURL}/get-shops</p>
        <p>Command Full Example</p>
        <pre id="addCommand"> 
            curl -d {
                storeName: &lt;NAME OF THE STORE&gt;,
                storeImage: &lt;IMAGE URL OF THE STORE&gt;,
                storeRating: &lt;YOUR RATING OF THE STORE&gt;,
                storeComment: &lt;YOUR COMMENT&gt;
            } ${locationURL}/get-shops
        </pre>
        <p>Make sure to remove &lt; and &gt;</p>
    `

    const deleteShopCommandHTML = `
        <p>Try for yourself, hint</p>
        <span id="deleteCommand">
            curl -d &lt;SHOP_ID TO DELETE&gt; ${locationURL}/delete-coffee-shop
        </span>
        <p>create a curl command to tell the server to delete a shop</p>
    `

    // const contentFailedToInitHTML = `
    //     <p><b>Here are some thing that can cause the setup to fail</b></p>
    //     <ul class="widget-todo-list " id="object-list" onload="listObjects()">
    //         ${initErrorCauses.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
    //     </ul>
    // `

    const contentPrerequisite = getCollapseContent({ 
        contentHTML: contentPrereqHTML, 
        actions: [],
        contentName:'Run These Two Commands Before Proceeding', 
        contentID:'prereq',
        collapse: ''
    })
    const contentGetShop = getCollapseContent({ 
        contentHTML: getCommandHTML, 
        actions: [
            {
                name: '<i class="fa fa-copy"> </i> Copy Command',
                method: `onpointerup="copyText('getCommand')"`,
                type: 'primary',
            },
        ],
        contentName: `GET - Get Coffee Shops Command`, 
        contentID:'get-command',
        collapse: ''
    })

    const contentAddCommandHTML = getCollapseContent({ 
        contentHTML: addShopCommandHTML, 
        actions: [
            {
                name: '<i class="fa fa-copy"> </i> Copy Command',
                method: `onpointerup="copyText('addCommand')"`,
                type: 'primary',
            },
        ],
        contentName:`POST - Add Coffee Shop Command`,  
        contentID:'add-command',
        collapse: ''
    })

    const contentDeleteCommand = getCollapseContent({ 
        contentHTML: deleteShopCommandHTML, 
        actions:[
            {
                name: '<i class="fa fa-copy"> </i> Copy Command',
                method: `onpointerup="copyText('deleteCommand')"`,
                type: 'primary',
            },
            // {
            //     id: 'test',
            //     name: 'Test',
            //     method: 'onpointerup=""',
            //     type: 'secondary',
            // },
        ],
        contentName: `DELETE - Add Coffee Shop Command`, 
        contentID:'delete-command',
        collapse: ''
    })

    // const contentFailedToInit = getCollapseContent({ 
    //     contentHTML: contentFailedToInitHTML, 
    //     actions:[],
    //     contentName:'Why Am I Getting An Error?', 
    //     contentID:'failedtoinit',
    //     collapse: ''
    // })
    const content = contentPrerequisite + "<br>" + 
                    contentGetShop + "<br>" + 
                    contentAddCommandHTML + "<br>" + 
                    contentDeleteCommand
                    // contentFailedToInit

    const template = getHTMLTemplate(
        'Curl Commands', 
        content, 
    )

    appElement.innerHTML = template
}

/// Commands Page helper
async function copyText (id) {
    const ele = getElementById(id)

    try {
        await navigator.clipboard.writeText(ele.innerText)
        showFlashMessage(`Command Copied! ${ele.innerText}`)
    } catch (error) {
        
    }
}


window.onload = () => {
    checkInitStatus().then(() => {
        setDashboard()
    })
}