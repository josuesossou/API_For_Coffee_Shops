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
1. Clone the repository <br>
``` git clone https://github.com/josuesossou/API_For_Coffee_Shops.git```<br>
2. Install the dependencies<br>
``` npm install ```<br>
3. Change into the correct directory<br>
```cd backend``` <br>
4. Build the docker image<br>
```npm run build```<br>
5. Start the server<br>
```npm start```<br>
6. Open the settings page of the app and provide your IAM credentials and the region.
7. Send a post request to the '/setup' endpoint to create the necessary AWS services in the cloud. This includes uploading a Lambda function zip file to an S3 bucket, creating an SQS queue, and a DynamoDB table. An event source mapping is also created to map the SQS queue to the Lambda function.
8. Once all the services are created, you can now use the application by adding information about a coffee shop you like or dislike. Fill out the form providing the name of the coffee shop, rating, image (optional), and comment. When the information is submitted, it hits the '/add-coffee-shop' endpoint. The server then pushes this information to the SQS queue, which triggers the Lambda function, and the information is added to the DynamoDB table.
9. Lastly, you can view all the coffee shops you added on the home page of the app.