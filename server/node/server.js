import express from "express";
import "dotenv/config";
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PORT = 8080 } = process.env;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});

const ordersController = new OrdersController(client);

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (cart) => {
  const collect = {
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: "100.00",
          },
        },
      ],
    },
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.createOrder(
      collect
    );
    console.log(
      "PayPal-Debug-Id (createOrder):",
      httpResponse.headers["paypal-debug-id"]
    );
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(
        "PayPal-Debug-Id (createOrder error):",
        error.headers?.["paypal-debug-id"]
      );
      throw new Error(error.message);
    }
  }
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
  const collect = {
    id: orderID,
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.captureOrder(
      collect
    );
    console.log(
      "PayPal-Debug-Id (captureOrder):",
      httpResponse.headers["paypal-debug-id"]
    );
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(
        "PayPal-Debug-Id (captureOrder error):",
        error.headers?.["paypal-debug-id"]
      );
      throw new Error(error.message);
    }
  }
};

app.post("/api/orders", async (req, res) => {
  try {
    const { cart } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrder(cart);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});

// Get order details
app.get("/api/orders/:orderID", async (req, res) => {
  console.log("GET order:", req.params.orderID);

  try {
    const { body, ...httpResponse } = await ordersController.getOrder({
      id: req.params.orderID,
    });
    console.log(
      "PayPal-Debug-Id (getOrder):",
      httpResponse.headers["paypal-debug-id"]
    );
    res.json(JSON.parse(body));
  } catch (error) {
    console.error("Error getting order:", error);
    console.log(
      "PayPal-Debug-Id (getOrder error):",
      error.headers?.["paypal-debug-id"]
    );
    res.status(500).json({ error: error.message });
  }
});

// Update order shipping
app.patch("/api/orders/:orderID", async (req, res) => {
  console.log("PATCH order:", req.params.orderID);
  console.log("Body:", req.body);

  const { shippingAmount } = req.body;

  try {
    const collect = {
      id: req.params.orderID,
      body: [
        {
          op: "replace",
          path: "/purchase_units/@reference_id=='default'/amount",
          value: {
            currency_code: "USD",
            value: (100 + shippingAmount).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: "100.00",
              },
              shipping: {
                currency_code: "USD",
                value: shippingAmount.toFixed(2),
              },
            },
          },
        },
      ],
    };

    const { ...httpResponse } = await ordersController.patchOrder(collect);
    console.log(
      "PayPal-Debug-Id (patchOrder):",
      httpResponse.headers["paypal-debug-id"]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error patching order:", error);
    console.log(
      "PayPal-Debug-Id (patchOrder error):",
      error.headers?.["paypal-debug-id"]
    );
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Node server listening at http://localhost:${PORT}/`);
});
