import { FlowBuilder } from "./flowBuilder.js";

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("root");

  // Fetch the flow data
  const response = await fetch("./flow_data.json");
  const flowData = await response.json();

  // Create and mount the flow builder
  const builder = new FlowBuilder(flowData, root);
  builder.render();
});
