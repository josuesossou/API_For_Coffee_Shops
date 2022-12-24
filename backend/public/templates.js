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
                    <input type="text" class="form-control" id="inputIAMRegion">
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
        'setup', 
        content,
    )

    appElement.innerHTML = template
    
    if (isInited && setupData && !isSetup) {
        waitTimetryAgain(5)
    } 

    setPreviousCredentials()
}


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

const prereqSteps = [
    '<b>Step 1:</b> Follow "Get Access and Screte Key" instructions',
    '<b>Step 2:</b> Follow "Get Role ARN" instructions',
    '<b>Step 3:</b> Follow "Get Region" instructions',
]

const access_secret_key_Steps = [
    '<b>Step 1:</b> Sign in to the AWS Management Console and open the IAM console at <a href="https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/users" target="_blank">https://console.aws.amazon.com/iam/users</a>',
    '<b>Step 2:</b> Click on the "Add users" button',
    '<b>Step 3:</b> Type the user name for the new user',
    '<b>Step 4:</b> Select "Access key - Programmatic access" for the AWS credential type',
    '<b>Step 5:</b> Click "Next: Permissions" button',
    '<b>Step 6:</b> Click on "Attach existing policies directly"',
    '<b>Step 7:</b> Under Policy name, Select "AdministratorAccess"', 
    '<b>Step 8:</b> Click "Next: Tags" button',
    '<b>Step 9:</b> Click "Next: Review" button',
    '<b>Step 10:</b> Click "Create user" button',
    'You will now see your Access key ID and Secret access key. Copy and paste each respectively in the "Access Key" and "Secret Key" text feilds'
]

const initErrorCauses = [
    'need to complete',
]

const rolearnHelpSteps = [
    '<b>Step 1:</b> need to complete.',
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
    const contentRoleARNHTML = `
        <p><b> Follow These these instructions to create a role arn for the user you have just created</b> </p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${rolearnHelpSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
    `

    const contentRegionHTML = `
        <p><b> Follow These these instructions to get the region of your AWS account</b> </p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${rolearnHelpSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
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
        contentName:'Prerequisite - Do this before initializing credentials on the setup Page', 
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
    const contentRoleARN = getCollapseContent({ 
        contentHTML: contentRoleARNHTML, 
        actions,
        contentName:'Create Policy', 
        contentID:'helpPool',
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
    const content = contentPrerequisite + "<br>" + contentIAM + "<br>" + 
                    contentRoleARN + "<br>" + contentRegion + "<br>" + contentFailedToInit

    const template = getHTMLTemplate(
        'Help', 
        content, 
    )

    appElement.innerHTML = template
}


window.onload = () => {
    checkInitStatus().then(() => {
        setDashboard()
    })
}