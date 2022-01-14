# Profit Aero
## CS 6242 Final Group Project

Presentation Video: https://youtu.be/a9EpT7x-x0A



## INSTALLATION and EXECUTION
Uncomment line 6(local version) and comment line 7(GCP deployment)
> pip3 install -r requirements.txt
> python3 main.py

To test front end application alone, use plain http.server in python
> cd static
> python3 -m http.server 8080

### Video
Local setup video: https://youtu.be/mXs1GYYLV2A
Link to the application: https://profit-aero-app-dot-profitaero.uc.r.appspot.com/index.html

## DESCRIPTION

### Code Structure
Each page is organized as a separate HTML file that calls its js functionalities inside. All static files are kept in a separate folder for ease of deployment.
1. Market Overview : overview.html
2. Customer Analytics : analytics.html
3. Product Analytics : product.html

All models are present in the Backend_codes module:
Association mining model
Customer Churn model
Customer Graph model
Data_prep_cleaning
Priyank's code has Sales driver model and graph weights
Product clustering
results

This application is packaged and deployed as a python flask application so that it can also support HTTP API calls that will be made to support the following roadmap items:
1. Product Name Clustering and Classification
2. Product Sales Driver

### Deployment
This app was deployed in Google Cloud Platform App Engine Standard Python Runtime Environment. The static path and other deployment configuration are mentioned in app.yaml
#### Steps to deploy
> 1. Request for access to the GCP project
> 2. Download and setup gcloud utils for your OS
> 3. Login using gcloud init and gcloud auth login
> 4. cd into the project directory where app.yaml is present
> 5. gcloud app deploy


### Data Preparation
Data Links:
UCI retail: https://archive.ics.uci.edu/ml/datasets/Online+Retail+II
Macro Indicators:  https://www.kaggle.com/kaggle/world-development-indicators?select=Indicators.csv

Step1: Download data from UCI retail
Step2: Clean the data file using 1_DataCleaning_priyank.ipynb to generate Transactdata_clean file
Step3: Download Macro Indicators
Step4: Use Macro_Indicators & Transactdata_clean in the Data-prep.ipynb to generate a joint file = base_dataset

Step5: Use Summary.ipynb to create data for main screen overview page
Step6: Use top_s to create top products and customers for overivew page 
Step7: Use Transactdata_clean for backend models
