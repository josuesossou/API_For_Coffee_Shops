const locationURL = location.protocol + '//' + location.host
console.log(locationURL)

const getElementById = (elementId) => {
  return document.getElementById(elementId)
}

const showFlashMessage = (message) => {
  const flashMessageEle = getElementById('flashcard-wrapper')

  flashMessageEle.style.display = 'block'
  flashMessageEle.innerHTML = `<center><p>${message}</p></center>`

  setTimeout(() => {
    flashMessageEle.innerHTML = ''
    flashMessageEle.style.display = 'none'
  }, 3000)
}

// API calls
async function initialize({ region, accessKey, secretKey }) {
  try {
    const res = await fetch(`${locationURL}/init`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        region,
        credential: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey
        }
      }),
    })

    const data = await res.json()
    sessionStorage.setItem('isInited', JSON.stringify(data.initStatus))
    sessionStorage.setItem('credentials', JSON.stringify({ 
      region,
      accessKey,
      secretKey
    }))
  } catch (error) {
    showFlashMessage(error)
  }
}

async function checkInitStatus() {
  try {
    const res = await fetch('http://localhost:3000/init-status')
    const data = await res.json()
  
    sessionStorage.setItem('isInited', JSON.stringify(data.initStatus))
  } catch (error) {
    showFlashMessage(error)
  }
}

function setPreviousCredentials() {
  const inputAccessKey = getElementById('inputIAMAccessKey')
  const inputSecretKey = getElementById('inputIAMSecretKey')
  const inputRegion = getElementById('inputIAMRegion')

  const credentials = JSON.parse(sessionStorage.getItem('credentials')) || false

  if (credentials && inputAccessKey) {
    const { region, accessKey, secretKey } = credentials
    inputAccessKey.value = accessKey
    inputSecretKey.value = secretKey
    inputRegion.value = region
  }
}

async function setUp() {
  const inputAccessKey = getElementById('inputIAMAccessKey').value
  const inputSecretKey = getElementById('inputIAMSecretKey').value
  const inputRegion = getElementById('inputIAMRegion').value
  const gearIcon = getElementById('setup-gear-icon')
  const setupBtn = getElementById('setup-btn')
  // add gearIcon annimation
  gearIcon.classList.remove('hide-gear-icon')
  gearIcon.classList.add('active-spin-animation')
  setupBtn.setAttribute('disabled', true)

  if (
    !inputAccessKey ||
    !inputSecretKey ||
    !inputRegion
  ) {
    // remove gear spin animation
    gearIcon.classList.remove('active-spin-animation')
    gearIcon.classList.add('hide-gear-icon')
    setupBtn.removeAttribute('disabled')
    return showFlashMessage('Please fill out all the text fields')
  }

  const { region, accessKey, secretKey } = {
    region: inputRegion,
    accessKey: inputAccessKey,
    secretKey: inputSecretKey
  }

  await initialize({ region, accessKey, secretKey })
  let isSetup = JSON.parse(sessionStorage.getItem('isSetup')) || false 

  if (isSetup) {
    // remove gear spin animation
    gearIcon.classList.remove('active-spin-animation') 
    gearIcon.classList.add('hide-gear-icon')
    // setupBtn.setAttribute('disabled', false)
    return setSetting()
  }

  try {
    const res = await fetch('http://localhost:3000/setup', { method: 'POST' })
    const data = await res.json()
    isSetup = true

    for (const res of data) {
      if (res.status === 500) isSetup = false
    }

    console.log(data)

    sessionStorage.setItem('setupData', JSON.stringify(data))
    sessionStorage.setItem('isSetup', JSON.stringify(isSetup))
  } catch (error) {
    showFlashMessage(error)
  }

  // remove gear spin animation
  gearIcon.classList.remove('active-spin-animation') 
  gearIcon.classList.add('hide-gear-icon')
  setSetting()
}

async function getCoffeeShops() {
  try {
    const res = await fetch('http://localhost:3000/get-shops')
    const data = await res.json()
  
    return data.data.Items
  } catch (error) {
    showFlashMessage(error)
    return []
  }
}

async function addCoffeeShop() {
  const storeName = getElementById('storename').value
  const storeRating = getElementById('storerating').value
  let storeImage = getElementById('storeimage').value
  const storeComment = getElementById('comment').value

  if (
    !storeName ||
    !storeRating ||
    !storeComment 
  ) {
    return showFlashMessage('Please fill out all the required text fields')
  }

  storeImage = storeImage || ''

  try {
    const res = await fetch('http://localhost:3000/addcoffeeshop', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ storeImage, storeName, storeRating, storeComment })
    })
  
    await res.json()
    showFlashMessage('You have added a new shop')
  } catch (error) {
    showFlashMessage(error)
  }
}

function tryAgain() {
  sessionStorage.removeItem('setupData')
  setSetting()
}

async function confirmDeletingServices () {
  if (!confirm(`This will reset your enviroment. 
  All of your data and services created for this app will be deleted.
  Are you sure you want to procceed?`)) return false

  await deleteAWSServices()
  return true
}

async function deleteAWSServices () {
  let isSetup = JSON.parse(sessionStorage.getItem('isSetup')) || false 

  if (!isSetup) {
    return setSetting()
  }

  try {
    const res = await fetch('http://localhost:3000/cleanup', { method: 'POST' })
    const data = await res.json()
    let success = true

    for (const res of data) {
      if (res.status === 500) {
        success = false
      }
    }

    if (success) {
      console.log(data)
      sessionStorage.removeItem('setupData')
      sessionStorage.removeItem('isSetup')
      
      showFlashMessage('Successfully cleaned environment')
    } else {
      showFlashMessage('Environment not cleaned properly')
    }

    setSetting()
  } catch (error) {
    showFlashMessage(error)
  }
}

async function deleteAndTryAgain() {
  const confirmed = await confirmDeletingServices()
  if (confirmed) {
    tryAgain ()
  }
}

function waitTimetryAgain (waitTime) {
  const waitTimer = getElementById('wait-timer')
  const tryAgain = getElementById('try-again')
  const deleteAndTry = getElementById('delete-try-again')

  if (waitTime < 0) {
    tryAgain.removeAttribute('disabled')
    deleteAndTry.removeAttribute('disabled')
  } else {
    waitTimer.innerHTML = `<span>${waitTime}</span>`
    setTimeout(waitTimetryAgain.bind(this, waitTime-1), 1500)
  }
}