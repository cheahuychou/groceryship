# GroceryShip

## Usage
A deployed version of GroceryShip is available on Heroku [here](http://groceryship.herokuapp.com/).

For a local version,
- You will need a `config.js` file in the `javascripts/` folder. The file should contain a module that exports an `Object` with the following methods:
    - `emailAddress`
    - `emailPassword`
    - `productionUrl`
    - `stripeClientId`
    - `stripeApiKey`
    - `stripePublishableKey`
    - `stripeTokenURI`
    - `stripeAuthorizeURI`
    - `mitPeopleClientId`
    - `mitPeopleClientSecret`
    
The methods should return a String of what is described in the method name. These will be used to send the verification and notification emails, access the Stripe API, and access the MIT People Directory API.
- Next, make sure you have Node.js, NPM, and [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community) which will be used for this project.
- Start the MongoDB server in one terminal window with `sudo mongod`.
- In another terminal window, install the dependencies with `npm install`.
- Start the app with `npm start`.
- The app will be available on [`http://localhost:3000`](http://localhost:3000).

Sign up restrictions:
- GroceryShip is designed to be used by people with an MIT email/kerberos, so only those with a valid kerberos (not a mailing list) can sign up. A kerberos is valid if it is in the MIT People Directory.
- However, in the local version where the app is in development mode, the app will allow an invalid kerberos to sign up for ease of testing. You will still have to verify the email account, so we suggest the use of an MIT mailing list that sends emails to yourself as a "kerberos" to test with. Additionally, you could manually get the verification token sent in the email from the local database, or check Sent Mail from the email account being used to send the verification emails.

Stripe instructions: 
- For both the local version and the deployed version, a Stripe Connect testing platform is used in the app. No real transactions will happen but you can see the testing transaction records in your Stripe account. 
- Users have to connect their GroceryShip accounts with their Stripe accounts during registration in order to receive future payments. If a user connects with a development mode Stripe account, the user can pay other users but cannot receive payments. When accepting items and paying the shoppers, the users will enter testing credit cards information. 
- One example testing Visa credit card number is 4242424242424242. The expiration date can be any time in the future and the CVC security code can be any three digits. More testing credit card numbers can be found in the [Stripe documentation](https://stripe.com/docs/testing#cards).

## Description
GroceryShip is a web application that facilitates peer grocery delivery. Students from the same college can post requests for groceries they need with a detailed description of the item/s. Students who are doing grocery shopping can then claim and fulfill these requests. Requesters specify how much they're willing to pay as a delivery fee and which pickup/delivery locations (dorms, living groups, other on-campus places) they prefer. Payments are made once delivery is complete and both parties indicate this in the app. We will focus on an implementation for MIT students first. 

## Motivation
MIT students are generally busy and do not have time to get groceries in grocery stores which are all quite far away from the main campus. This web application will allow those who are busy to get the groceries in less time and those who make it to grocery stores to earn pocket money by delivering groceries for peers. 

Existing solutions include the delivery services of each grocery store (if it exists) and 3rd party delivery services such as Instacart. The main difference is that GroceryShip is a peer to peer delivery service where your peers help you buy your groceries. Users can also specify how much they’re willing to pay as delivery fee whereas other services have a fixed delivery fee. Other services also have a minimum price or number of items you need to buy in order to avail of delivery, whereas with GroceryShip, you can request for any items.

## Authorship
### Design Document
- Project Overview (Czarina Lao)
- Motivation (Czarina Lao)
- Definitions (Czarina Lao)
- Concepts (Czarina Lao)
- Anticipated Misfits (Czarina Lao)
- Data Model (Joseph Kuan)
- Security Concerns (Czarina Lao)
- APIs (Czarina Lao)
- User Interface (Cheahuychou Mao)
- Design Risks (Chien-Hsun Chang)
- Design Choices (Cheahuychou Mao)

### Code
- javascripts
    - authentication.js (Cheahuychou Mao)
    - email.js (Cheahuychou Mao)
    - hbs_helpers.js (Cheahuychou Mao)
    - utils.js (Cheahuychou Mao)
- models
    - delivery.js (Joseph Kuan)
    - user.js (Cheahuychou Mao)
- public
    - javascript
        - dashboard.js (Czarina Lao)
        - dashboard_helpers.js (Czarina Lao)
        - deliver.js (Czarina Lao)
        - faq.js (Czarina Lao)
        - index.js (Czarina Lao)
        - login.js (Joseph Kuan)
        - navbar.js (Czarina Lao)
        - notifications.js (Cheahuychou Mao)
        - profile.js (Chien-Hsun Chang)
        - rating.js (Cheahuychou Mao)
        - request.js (Czarina Lao)
        - user_info.js (Czarina Lao)
        - validation.js (Czarina Lao)
    - stylesheets
        - dashboard.css (Czarina Lao)
        - deliver.css (Czarina Lao)
        - faq.css (Czarina Lao)
        - flatpickr_add.css (Czarina Lao)
        - home.css (Czarina Lao)
        - profile.css (Czarina Lao)
        - rating.css (Czarina Lao)
        - request.css (Czarina Lao)
        - style.css (Czarina Lao)
        - tile.css (Czarina Lao)
- routes
    - deliveries.js (Joseph Kuan)
    - index.js (Cheahuychou Mao)
    - users.js (Chien-Hsun Chang)
- test
    - client_side
        - format.js (Czarina Lao)
        - helpers_test.html (Czarina Lao)
        - validation.js (Czarina Lao)
    - authentication_test.js (Cheahuychou Mao)
    - delivery_test.js (Joseph Kuan)
    - email_test.js (Cheahuychou Mao)
    - rating_test.js (Chien-Hsun Chang)
    - user_test.js (Cheahuychou Mao)
    - utils_test.js (Czarina Lao)
- views
    - layouts
        - index.hbs (Czarina Lao)
    - partials
        - accept.hbs (Cheahuychou Mao)
        - card_input.hbs (Chien-Hsun Chang)
        - close.hbs (Cheahuychou Mao)
        - contact_information.hbs (Joseph Kuan)
        - cost_summary.hbs (Czarina Lao)
        - deliveries_table.hbs (Czarina Lao)
        - filters.hbs (Joseph Kuan)
        - item_headings.hbs (Czarina Lao)
        - item_row.hbs (Czarina Lao)
        - login_register.hbs (Cheahuychou Mao)
        - navbar_logged_in.hbs (Czarina Lao)
        - notification_item.hbs (Joseph Kuan)
        - notifications.hbs (Joseph Kuan)
        - rating.hbs (Cheahuychou Mao)
        - reject.hbs (Cheahuychou Mao)
        - request_form.hbs (Czarina Lao)
        - request_item.hbs (Czarina Lao)
        - requests.hbs (Czarina Lao)
        - requests_table.hbs (Czarina Lao)
        - set_pickup.hbs (Czarina Lao)
        - signup.hbs (Chien-Hsun Chang)
    - dashboard.hbs (Czarina Lao)
    - deliver.hbs (Czarina Lao)
    - error.hbs (Cheahuychou Mao)
    - faq.hbs (Chien-Hsun Chang)
    - home.hbs (Czarina Lao)
    - profile.hbs (Chien-Hsun Chang)
    - request.hbs (Czarina Lao)
    - suspended.hbs (Joseph Kuan)
- app.js (Cheahuychou Mao)
