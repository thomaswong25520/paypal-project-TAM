// Get orderID from URL
const urlParams = new URLSearchParams(window.location.search);
const orderID = urlParams.get("orderID");

console.log("OrderID:", orderID);

// Fetch order details
async function loadOrder() {
  console.log("Loading order...");

  const response = await fetch(`/api/orders/${orderID}`);
  const data = await response.json();

  console.log("Order data:", data);

  document.getElementById("order-details").innerHTML = `
    <p>Order ID: ${orderID}</p>
    <p>Status: ${data.status}</p>
  `;
}

loadOrder();
