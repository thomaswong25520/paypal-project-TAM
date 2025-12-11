const processRefund = async (type) => {
  const captureId = document.getElementById("capture-id").value;
  const amountInput = document.getElementById("refund-amount").value;
  const resultDiv = document.getElementById("result");

  if (!captureId) {
    resultDiv.innerHTML = "<p style='color:red;'>Please enter a Capture ID</p>";
    return;
  }

  if (type === "partial" && !amountInput) {
    resultDiv.innerHTML =
      "<p style='color:red;'>Please enter an amount for partial refund</p>";
    return;
  }

  resultDiv.innerHTML = "<p>Processing refund...</p>";

  try {
    const body = {};
    if (type === "partial" && amountInput) {
      body.amount = amountInput;
    }

    const response = await fetch(`/api/orders/${captureId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Refund response:", data);

    if (data.id) {
      resultDiv.innerHTML = `
          <h3 style="color:green;">Refund Successful</h3>
          <p><strong>Refund ID:</strong> ${data.id}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Amount:</strong> ${data.amount?.currency_code || "USD"} ${
        data.amount?.value || "Full"
      }</p>
        `;
    } else {
      resultDiv.innerHTML = `
          <h3 style="color:red;">Refund Failed</h3>
          <p>${data.message || data.error || JSON.stringify(data)}</p>
        `;
    }
  } catch (error) {
    console.error("Error:", error);
    resultDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
};

// Event listeners
document
  .getElementById("full-refund-btn")
  .addEventListener("click", () => processRefund("full"));
document
  .getElementById("partial-refund-btn")
  .addEventListener("click", () => processRefund("partial"));
