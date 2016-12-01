# GroceryShip

## Usage
A deployed version of GroceryShip is available on Heroku [here](http://groceryship.herokuapp.com/).

For a local version,
- Make sure you have Node.js, NPM, and [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community) which will be used for this project.
- Start the MongoDB server in one terminal window with `sudo mongod`.
- In another terminal window, install the dependencies with `npm install`.
- Start the app with `npm start`.
- The app will be available on [`http://localhost:3000`](http://localhost:3000).

## Description
GroceryShip is a web application that facilitates peer grocery delivery. Students from the same college can post requests for groceries they need with a detailed description of the item/s. Students who are doing grocery shopping can then claim and fulfill these requests. Requesters specify how much they're willing to pay as a delivery fee and which pickup/delivery locations (dorms, living groups, other on-campus places) they prefer. Payments are made once delivery is complete and both parties indicate this in the app. We will focus on an implementation for MIT students first. 

## Motivation
MIT students are generally busy and do not have time to get groceries in grocery stores which are all quite far away from the main campus. This web application will allow those who are busy to get the groceries in less time and those who make it to grocery stores to earn pocket money by delivering groceries for peers. 

Existing solutions include the delivery services of each grocery store (if it exists) and 3rd party delivery services such as Instacart. The main difference is that GroceryShip is a peer to peer delivery service where your peers help you buy your groceries. Users can also specify how much they’re willing to pay as delivery fee whereas other services have a fixed delivery fee. Other services also have a minimum price or number of items you need to buy in order to avail of delivery, whereas with GroceryShip, you can request for any items.

## Authorship
### Design Document
- Project Overview (Czarina)
- Motivation (Czarina)
- Definitions (Czarina)
- Concepts (Czarina)
- Anticipated Misfits (Czarina)
- Data Model (Joseph)
- Security Concerns (Czarina)
- APIs (Czarina)
- User Interface (Chou)
- Design Risks (Vincent)
- Design Choices (Chou)

### Code
- models
    - delivery.js
    - user.js
- public
    - javascript
        - dashboard.js
        - deliver.js
        - index.js
        - request.js
        - utils.js
    - stylesheets
        - style.css
- routes
    - deliveries.js
    - index.js
    - users.js
- views
    - layouts
        - index.hbs
    - partials
        - deliveries_table.hbs
        - item_headings.hbs
        - item_row.hbs
        - login_register.hbs
        - navbar_logged_in.hbs
        - request_form.hbs
        - request_item_form.hbs
        - requests_table.hbs
    - dashboard.hbs
    - deliver.hbs
    - error.hbs
    - home.hbs
    - request.hbs
- app.js
