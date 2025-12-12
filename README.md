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

![Checkout page with PayPal button](phase1-screenshots/phase1_1.png)

### PayPal Popup

![PayPal login popup](phase1-screenshots/phase1_6.png)

### Review Page

#### Marseille

![Review Page](phase1-screenshots/phase1_2.png)

#### Paris

![Review Page](phase1-screenshots/phase1_Paris.png)

### Payment Success

#### Marseille

![Payment confirmation](phase1-screenshots/phase1_3.png)

#### Paris

![Payment confirmation](phase1-screenshots/phase1_Paris2.png)

### Sandbox Dashboard

#### Customer Marseille

![Transaction in PayPal Sandbox Buyer](phase1-screenshots/phase1_4.png)

#### Merchant Marseille

![Transaction in PayPal Sandbox Seller](phase1-screenshots/phase1_5.png)

#### Customer Paris

![Transaction in PayPal Sandbox Buyer](phase1-screenshots/phase1_Paris3.png)

#### Merchant Paris

![Transaction in PayPal Sandbox Seller](phase1-screenshots/phase1_Paris4.png)

## Debugging

The server logs `PayPal-Debug-Id` for each API call. Use this ID when contacting PayPal Support.

Example:

### createOrder API Call

![REST Orders API (v2) + PayPal-Debug-Id](phase1-screenshots/phase1_createOrder.png)

### getOrder API Call

![REST Orders API (v2) + PayPal-Debug-Id](phase1-screenshots/phase1_getOrder.png)

### patchOrder API Call

![REST Orders API (v2) + PayPal-Debug-Id](phase1-screenshots/phase1_patchOrder.png)

### captureOrder API Call

![REST Orders API (v2) + PayPal-Debug-Id](phase1-screenshots/phase1_captureOrder.png)
