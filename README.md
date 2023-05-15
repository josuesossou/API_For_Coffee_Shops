# Coffee Shop Review App
This project is a web application built using NodeJS, JavaScript, HTML and CSS, that allows users to add, view and rate their favorite and least favorite coffee shops. The app utilizes the AWS SDKs to connect to various AWS services such as Lambda, DynamoDB, SQS, S3 bucket, and IAM.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
. NodeJS <br>
. npm <br>
. Docker <br>
. AWS account and IAM credentials <br>

### Installation
Steps To Start Running Coffee Shop API

1. Go to https://github.com/josuesossou/API_For_Coffee_Shops 
2. Click on “Code”, Then Click on “Download Zip” to download the files
3. Go To your download folder or the folder in which the zip folder is located and extract it by double clicking on it; or you can use any of your extracting tool to extract the zip folder
4. Open Command Prompt if you are on Windows or Terminal if you are on Mac
5. Change the directory to the root level of the backend folder that is in the folder you extracted: (API_For_Coffee_Shops-main/backend). You could also type cd then drag and drop the folder in the terminal to change the directory to the folder. This may only work on Mac.
6. Download Docker from this website: Download Docker Desktop | Docker, and complete the installation.
7. Open Docker after it’s installed and it should start running automatically
8. Go to the root of the project folder (API_For_Coffee_Shops-main/backend) in your terminal or command prompt. Run these two commands:
    docker build -t backend .
    docker run -p 3000:3000 backend
9. Open your browser and go to localhost:3000
10. Click on the Help tab on the left to follow additional steps if not done already

### Additional Info
Open the settings page of the app and provide your IAM credentials and the region.
 Send a post request to the '/setup' endpoint to create the necessary AWS services in the cloud. This includes uploading a Lambda function zip file to an S3 bucket, creating an SQS queue, and a DynamoDB table. An event source mapping is also created to map the SQS queue to the Lambda function.
 Once all the services are created, you can now use the application by adding information about a coffee shop you like or dislike. Fill out the form providing the name of the coffee shop, rating, image (optional), and comment. When the information is submitted, it hits the '/add-coffee-shop' endpoint. The server then pushes this information to the SQS queue, which triggers the Lambda function, and the information is added to the DynamoDB table.
 Lastly, you can view all the coffee shops you added on the home page of the app.

## Authors
Josue Sossou