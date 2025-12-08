const urlParams = new URLSearchParams(window.location.search);
const orderID = urlParams.get("orderID");

console.log("OrderID:", orderID);

async function loadOrder() {
  console.log("Loading order...");

  const response = await fetch(`/api/orders/${orderID}`);
  const data = await response.json();

  console.log("Order data:", data);

  // Get address
  const address = data.purchase_units[0].shipping.address;
  console.log("Address:", address);

  // Display address
  document.getElementById("order-details").innerHTML = `
    <h2>Shipping Address</h2>
    <p>${address.address_line_1 || ""}</p>
    <p>${address.admin_area_2 || ""}, ${address.postal_code || ""}</p>
    <p>${address.country_code || ""}</p>
  `;
}

loadOrder();
