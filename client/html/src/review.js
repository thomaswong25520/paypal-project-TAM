const urlParams = new URLSearchParams(window.location.search);
const orderID = urlParams.get("orderID");

console.log("OrderID:", orderID);

let shippingCost = 0;

async function loadOrder() {
  console.log("Loading order...");

  const response = await fetch(`/api/orders/${orderID}`);
  const data = await response.json();

  console.log("Order data:", data);

  // Get address
  const address = data.purchase_units[0].shipping.address;
  console.log("Address:", address);

  // Calculate shipping
  const postalCode = address.postal_code || "";
  if (postalCode.startsWith("75")) {
    shippingCost = 5;
  } else if (postalCode.startsWith("13")) {
    shippingCost = 9;
  } else if (postalCode.startsWith("69")) {
    shippingCost = 12;
  } else {
    shippingCost = 15;
  }

  console.log("Shipping cost:", shippingCost);

  // Display
  document.getElementById("order-details").innerHTML = `
    <h2>Shipping Address</h2>
    <p>${address.address_line_1 || ""}</p>
    <p>${address.admin_area_2 || ""}, ${address.postal_code || ""}</p>
    <p>${address.country_code || ""}</p>
    
    <h2>Shipping Cost</h2>
    <p>$${shippingCost.toFixed(2)}</p>
    <p>Total: $${(100 + shippingCost).toFixed(2)}</p>
  `;
}

// Confirm button
document.getElementById("confirm-btn").onclick = async function () {
  console.log("Confirming order...");

  try {
    // Update shipping
    console.log("Updating shipping...");
    await fetch(`/api/orders/${orderID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingAmount: shippingCost }),
    });

    console.log("Shipping updated");

    // Capture payment
    console.log("Capturing payment...");
    const captureResponse = await fetch(`/api/orders/${orderID}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await captureResponse.json();
    console.log("Capture result:", result);

    if (result.status === "COMPLETED") {
      console.log("Payment successful!");

      document.body.innerHTML = `
          <div style="text-align:center; padding:50px;">
            <h1 style="color:green;">Payment Successful!</h1>
            <p>Order ID: ${orderID}</p>
            <p>Total: $${(100 + shippingCost).toFixed(2)}</p>
            <p>Thank you for your purchase!</p>
          </div>
        `;
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Payment failed: " + error.message);
  }
};

loadOrder();
