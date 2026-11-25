// Single place to rename the product. Everything else reads from here.
window.SITE = {
  brand: "City PMU",
  company: "Human Matrix", // footer only; confirm with owner
  demoUrl: "https://matrixtrackdemo.vercel.app", // clickable demo, fictional city; empty hides the link
  // Apps Script web-app URL that appends to the pipeline sheet and alerts the closer. Set at deploy; never commit a real one.
  formEndpoint: "",
  fallbackContact: "", // phone/WhatsApp shown if the form fails; set at deploy
  // Indicative tariff for the estimator. DRAFT until the owner confirms. Rupees, before GST.
  pricing: {
    cityFee: 800000,      // per month
    minFee: 1500000,      // per month
    baseRate: 3.5,        // per household per month at mid size
    smallAdj: 1,          // added to the rate for a city at or below popLow
    bigAdj: -0.5,          // added to the rate for a city at or above popHigh
    minRate: 0.5,         // floor so a big city never prices near zero
    popLow: 200000,       // rate moves smoothly (log scale) between these two populations
    popHigh: 3000000,
    persons: 4.5          // avg urban household size, Census 2011; households = population / this
  }
};
