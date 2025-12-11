import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
} from "@paypal/paypal-server-sdk";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

// Serve static files
app.use("/client", express.static(path.join(__dirname, "../../client")));

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
const paymentsController = new PaymentsController(client);

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

/**
 * Refund a captured payment.
 * @see https://developer.paypal.com/docs/api/payments/v2/#captures_refund
 */
const refundCapture = async (captureId, amount = null) => {
  const refundRequest = {
    captureId: captureId,
    prefer: "return=representation",
  };

  // If amount provided = partial refund, otherwise full refund
  if (amount) {
    refundRequest.body = {
      amount: {
        currencyCode: "USD",
        value: amount,
      },
    };
  }

  try {
    const { body, ...httpResponse } =
      await paymentsController.refundCapturedPayment(refundRequest);
    console.log(
      "PayPal-Debug-Id (refundCapture):",
      httpResponse.headers["paypal-debug-id"]
    );
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(
        "PayPal-Debug-Id (refundCapture error):",
        error.headers?.["paypal-debug-id"]
      );
      throw new Error(error.message);
    }
    throw error;
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

// Refund a captured payment
app.post("/api/orders/:captureID/refund", async (req, res) => {
  try {
    const { captureID } = req.params;
    const { amount } = req.body;

    console.log("Refund request - Capture ID:", captureID);
    console.log("Refund amount:", amount || "Full refund");

    const { jsonResponse, httpStatusCode } = await refundCapture(
      captureID,
      amount
    );

    console.log("Refund response:", jsonResponse);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to refund:", error);
    res.status(500).json({ error: "Failed to process refund." });
  }
});

app.listen(PORT, () => {
  console.log(`Node server listening at http://localhost:${PORT}/`);
});
