// Single place to rename the product. Everything else reads from here.
window.SITE = {
  brand: "City PMU",
  company: "Human Matrix", // footer only; confirm with owner
  // Apps Script web-app URL that appends to the pipeline sheet and alerts the closer. Set at deploy; never commit a real one.
  formEndpoint: "",
  fallbackContact: "" // phone/WhatsApp shown if the form fails; set at deploy
};
