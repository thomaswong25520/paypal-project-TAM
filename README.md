# PayPal Integration - Phase 1: PayPal Buttons

## Overview

Basic PayPal checkout integration using the PayPal JavaScript SDK and Server SDK.

The frontend sends HTTP requests via `fetch` to the Express backend. The backend uses the PayPal Server SDK to call PayPal REST APIs for order creation and payment capture.

```
Frontend → Express Routes → PayPal SDK → PayPal REST API
```

## Flow

1. Customer clicks PayPal button
2. Frontend calls `POST /api/orders` → creates order via PayPal API
3. PayPal popup opens for customer authentication
4. Customer approves payment
5. Frontend calls `POST /api/orders/:id/capture` → captures payment via PayPal API
6. Payment complete, confirmation displayed

## Tech Stack

- **Frontend**: HTML, JavaScript, PayPal JS SDK
- **Backend**: Node.js, Express, @paypal/paypal-server-sdk
- **API**: PayPal Orders API v2

## Setup

### 1. Install dependencies

```bash
cd server/node
npm install
```

### 2. Configure environment

Add your PayPal credentials to your shell config file (`~/.zshrc` or `~/.bashrc`):

```bash
export PAYPAL_CLIENT_ID="your_client_id"
export PAYPAL_CLIENT_SECRET="your_client_secret"
```

Then reload the config:

```bash
source ~/.zshrc
# or
source ~/.bashrc
```

### 3. Run server

```bash
npm start
```

### 4. Open frontend

```bash
npm start
```

Then click on

```
http://localhost:3000/
```

## API Endpoints

| Method | Endpoint                       | Description             |
| ------ | ------------------------------ | ----------------------- |
| POST   | `/api/orders`                  | Create PayPal order     |
| POST   | `/api/orders/:orderID/capture` | Capture payment         |
| GET    | `/api/orders/:orderID`         | Get order details       |
| PATCH  | `/api/orders/:orderID`         | Update order (shipping) |

## Screenshots

### Checkout Page

<img src="phase1-screenshots/phase1_1.png" width="800">

### PayPal Popup

<img src="phase1-screenshots/phase1_6.png" width="800">

### Review Page

#### Marseille

<img src="phase1-screenshots/phase1_2.png" width="800">

#### Paris

<img src="phase1-screenshots/phase1_Paris.png" width="800">

### Payment Success

#### Marseille

<img src="phase1-screenshots/phase1_3.png" width="800">

#### Paris

<img src="phase1-screenshots/phase1_Paris2.png" width="800">

### Sandbox Dashboard

#### Customer Marseille

<img src="phase1-screenshots/phase1_4.png" width="800">

#### Merchant Marseille

<img src="phase1-screenshots/phase1_5.png" width="800">

#### Customer Paris

<img src="phase1-screenshots/phase1_Paris3.png" width="800">

#### Merchant Paris

<img src="phase1-screenshots/phase1_Paris4.png" width="800">

## Debugging

The server logs `PayPal-Debug-Id` for each API call

Example:

### createOrder API Call

<img src="phase1-screenshots/phase1_createOrder.png" width="800">

### getOrder API Call

<img src="phase1-screenshots/phase1_getOrder.png" width="800">

### patchOrder API Call

<img src="phase1-screenshots/phase1_patchOrder.png" width="800">

### captureOrder API Call

<img src="phase1-screenshots/phase1_captureOrder.png" width="800">
