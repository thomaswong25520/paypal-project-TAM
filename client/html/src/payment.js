// Get customer data
const customerData = JSON.parse(sessionStorage.getItem("customerData") || "{}");

// Redirect if no data
if (!customerData.firstName) {
  window.location.href = "index.html";
}

// Display customer info
document.getElementById("shipping-address").innerHTML =
  customerData.firstName +
  " " +
  customerData.lastName +
  "<br>" +
  customerData.addressLine1 +
  "<br>" +
  customerData.city +
  ", " +
  customerData.state +
  " " +
  customerData.postalCode +
  "<br>" +
  customerData.countryCode;

const resultMessage = (message) => {
  document.getElementById("result-message").innerHTML = message;
};

// PayPal Buttons
paypal
  .Buttons({
    createOrder: () => {
      return fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: [{ id: "product-1", quantity: 1 }],
        }),
      })
        .then((response) => response.json())
        .then((order) => order.id);
    },

    onApprove: (data) => {
      return fetch(`/api/orders/${data.orderID}/capture`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((orderData) => {
          console.log("Capture result", orderData);
          const transaction = orderData.purchase_units[0].payments.captures[0];
          resultMessage(
            `Transaction ${transaction.status}: ${transaction.id}<br>Thank you for your payment!`
          );
        });
    },

    onError: (error) => {
      console.error(error);
      resultMessage("PayPal error");
    },
  })
  .render("#paypal-button-container");

// Card Fields
const cardField = paypal.CardFields({
  createOrder: () => {
    return fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: [{ id: "product-1", quantity: 1 }],
      }),
    })
      .then((res) => res.json())
      .then((orderData) => orderData.id);
  },

  onApprove: (data) => {
    return fetch(`/api/orders/${data.orderID}/capture`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((orderData) => {
        console.log("Card payment captured", orderData);
        const transaction = orderData.purchase_units[0].payments.captures[0];
        resultMessage(
          `Transaction ${transaction.status}: ${transaction.id}<br>Thank you for your payment!`
        );
      });
  },

  onError: (error) => {
    console.error("Card error:", error);
    resultMessage("Card payment failed");
  },
});

// Render card fields
if (cardField.isEligible()) {
  cardField.NameField().render("#card-name-field-container");
  cardField.NumberField().render("#card-number-field-container");
  cardField.ExpiryField().render("#card-expiry-field-container");
  cardField.CVVField().render("#card-cvv-field-container");

  document
    .getElementById("card-field-submit-button")
    .addEventListener("click", () => {
      cardField
        .submit({
          billingAddress: {
            addressLine1: customerData.addressLine1,
            adminArea1: customerData.state,
            adminArea2: customerData.city,
            countryCode: customerData.countryCode,
            postalCode: customerData.postalCode,
          },
        })
        .then(() => {
          console.log("Card submitted");
        })
        .catch((err) => {
          console.error("Submit error:", err);
          resultMessage("Card payment failed");
        });
    });
} else {
  document.getElementById("card-form").innerHTML =
    "<p>Card payments not available</p>";
}
