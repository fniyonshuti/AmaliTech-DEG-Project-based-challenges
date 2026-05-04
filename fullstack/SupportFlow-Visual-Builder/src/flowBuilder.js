/**
 * FlowBuilder Component
 * A visual decision tree editor for SupportFlow
 */

export class FlowBuilder {
  constructor(flowData, container) {
    this.container = container;
    this.originalData = JSON.parse(JSON.stringify(flowData));
    this.nodeMap = this.buildNodeMap(flowData.nodes);
    this.meta = flowData.meta;
    this.nodes = flowData.nodes;

    // State management
    this.mode = "editor"; // 'editor' or 'preview'
    this.editingNodeId = null;
    this.currentNodeId = "1"; // Start node for preview
    this.selectedNodeId = null;
    this.previewHistory = [];
    this.draggedNode = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  buildNodeMap(nodes) {
    const map = {};
    nodes.forEach((node) => {
      map[node.id] = node;
    });
    return map;
  }

  render() {
    this.container.innerHTML = "";

    // Create main layout
    const layout = document.createElement("div");
    layout.className = "sf-layout";

    // Create header with controls
    const header = this.createHeader();
    layout.appendChild(header);

    // Create main content
    const content = document.createElement("div");
    content.className = "sf-content";

    if (this.mode === "editor") {
      content.appendChild(this.createEditorView());
    } else {
      content.appendChild(this.createPreviewView());
    }

    layout.appendChild(content);
    this.container.appendChild(layout);

    // Attach event listeners
    if (this.mode === "editor") {
      this.attachEditorListeners();
    } else {
      this.attachPreviewListeners();
    }
  }

  createHeader() {
    const header = document.createElement("div");
    header.className = "sf-header";

    const title = document.createElement("h1");
    title.className = "sf-title";
    title.textContent = "SupportFlow Builder";
    header.appendChild(title);

    const controls = document.createElement("div");
    controls.className = "sf-controls";

    const modeToggle = document.createElement("button");
    modeToggle.className = "sf-btn sf-btn-primary";
    modeToggle.textContent = this.mode === "editor" ? "▶ Preview" : "✏️ Edit";
    modeToggle.addEventListener("click", () => this.toggleMode());
    controls.appendChild(modeToggle);

    if (this.mode === "preview" && this.previewHistory.length > 0) {
      const backBtn = document.createElement("button");
      backBtn.className = "sf-btn";
      backBtn.textContent = "← Back";
      backBtn.addEventListener("click", () => this.goBack());
      controls.appendChild(backBtn);
    }

    if (this.mode === "preview") {
      const restartBtn = document.createElement("button");
      restartBtn.className = "sf-btn";
      restartBtn.textContent = "🔄 Restart";
      restartBtn.addEventListener("click", () => this.restartPreview());
      controls.appendChild(restartBtn);
    }

    header.appendChild(controls);
    return header;
  }

  createEditorView() {
    const view = document.createElement("div");
    view.className = "sf-editor-view";

    // Canvas for flowchart
    const canvas = document.createElement("div");
    canvas.className = "sf-canvas";
    canvas.style.width = `${this.meta.canvas_size.w}px`;
    canvas.style.height = `${this.meta.canvas_size.h}px`;

    // SVG for connectors
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "sf-connectors");
    svg.setAttribute("width", this.meta.canvas_size.w);
    svg.setAttribute("height", this.meta.canvas_size.h);

    // Draw all connectors
    this.nodes.forEach((node) => {
      if (node.options && node.options.length > 0) {
        node.options.forEach((option, index) => {
          const targetNode = this.nodeMap[option.nextId];
          if (targetNode) {
            this.drawConnector(svg, node, targetNode);
          }
        });
      }
    });

    canvas.appendChild(svg);

    // Render all nodes
    this.nodes.forEach((node) => {
      const nodeEl = this.createNodeElement(node);
      canvas.appendChild(nodeEl);
    });

    view.appendChild(canvas);

    // Info panel
    const infoPanel = this.createInfoPanel();
    view.appendChild(infoPanel);

    return view;
  }

  drawConnector(svg, fromNode, toNode) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    // Calculate positions (center of nodes)
    const fromX = fromNode.position.x + 100; // Half of node width
    const fromY = fromNode.position.y + 30; // Bottom of node
    const toX = toNode.position.x + 100;
    const toY = toNode.position.y; // Top of node

    line.setAttribute("x1", fromX);
    line.setAttribute("y1", fromY);
    line.setAttribute("x2", toX);
    line.setAttribute("y2", toY);
    line.setAttribute("class", "sf-connector-line");

    svg.appendChild(line);

    // Draw arrowhead
    const defs = svg.querySelector("defs");
    if (!defs) {
      const newDefs = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs",
      );
      const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "marker",
      );
      marker.setAttribute("id", "arrowhead");
      marker.setAttribute("markerWidth", "10");
      marker.setAttribute("markerHeight", "10");
      marker.setAttribute("refX", "9");
      marker.setAttribute("refY", "3");
      marker.setAttribute("orient", "auto");

      const poly = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon",
      );
      poly.setAttribute("points", "0 0, 10 3, 0 6");
      poly.setAttribute("fill", "rgba(0, 212, 255, 0.8)");

      marker.appendChild(poly);
      newDefs.appendChild(marker);
      svg.insertBefore(newDefs, svg.firstChild);
    }

    line.setAttribute("marker-end", "url(#arrowhead)");
  }

  createNodeElement(node) {
    const nodeEl = document.createElement("div");
    nodeEl.className = `sf-node sf-node-${node.type}`;
    nodeEl.dataset.id = node.id;
    nodeEl.style.left = `${node.position.x}px`;
    nodeEl.style.top = `${node.position.y}px`;

    nodeEl.addEventListener("click", () => {
      this.selectNode(node.id);
    });

    nodeEl.addEventListener("mousedown", (e) => {
      this.startDrag(e, node);
    });

    // Node header
    const header = document.createElement("div");
    header.className = "sf-node-header";
    const typeLabel = document.createElement("span");
    typeLabel.className = "sf-node-type";
    typeLabel.textContent = node.type.toUpperCase();
    header.appendChild(typeLabel);
    nodeEl.appendChild(header);

    // Node text
    const text = document.createElement("div");
    text.className = "sf-node-text";
    text.textContent = node.text;
    nodeEl.appendChild(text);

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "sf-node-edit-btn";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.editNode(node.id);
    });
    nodeEl.appendChild(editBtn);

    // Options display
    if (node.options && node.options.length > 0) {
      const optionsDiv = document.createElement("div");
      optionsDiv.className = "sf-node-options";
      node.options.forEach((option) => {
        const optionTag = document.createElement("span");
        optionTag.className = "sf-option-tag";
        optionTag.textContent = option.label;
        optionsDiv.appendChild(optionTag);
      });
      nodeEl.appendChild(optionsDiv);
    }

    return nodeEl;
  }

  createInfoPanel() {
    const panel = document.createElement("div");
    panel.className = "sf-info-panel";

    const title = document.createElement("h3");
    title.textContent = "Node Information";
    panel.appendChild(title);

    const content = document.createElement("div");
    content.className = "sf-info-content";

    if (this.selectedNodeId) {
      const node = this.nodeMap[this.selectedNodeId];
      if (node) {
        const info = document.createElement("div");
        info.innerHTML = `
          <div class="sf-info-row">
            <strong>ID:</strong> ${node.id}
          </div>
          <div class="sf-info-row">
            <strong>Type:</strong> ${node.type}
          </div>
          <div class="sf-info-row">
            <strong>Text:</strong> ${node.text}
          </div>
          ${
            node.options.length > 0
              ? `
            <div class="sf-info-row">
              <strong>Options:</strong>
              <ul>
                ${node.options.map((opt) => `<li>${opt.label} → Node ${opt.nextId}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
        `;
        content.appendChild(info);
      }
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "sf-info-placeholder";
      placeholder.textContent = "Click a node to view details";
      content.appendChild(placeholder);
    }

    panel.appendChild(content);
    return panel;
  }

  createPreviewView() {
    const view = document.createElement("div");
    view.className = "sf-preview-view";

    const currentNode = this.nodeMap[this.currentNodeId];
    if (!currentNode) return view;

    // Create chat interface
    const chatContainer = document.createElement("div");
    chatContainer.className = "sf-chat-container";

    // History
    this.previewHistory.forEach((msg) => {
      const msgEl = document.createElement("div");
      msgEl.className = `sf-chat-message ${msg.type}`;
      msgEl.textContent = msg.text;
      chatContainer.appendChild(msgEl);
    });

    // Current node
    const nodeMsg = document.createElement("div");
    nodeMsg.className = "sf-chat-message bot";
    nodeMsg.textContent = currentNode.text;
    chatContainer.appendChild(nodeMsg);

    view.appendChild(chatContainer);

    // Options (if not end node)
    if (currentNode.options && currentNode.options.length > 0) {
      const optionsContainer = document.createElement("div");
      optionsContainer.className = "sf-options-container";

      currentNode.options.forEach((option) => {
        const optBtn = document.createElement("button");
        optBtn.className = "sf-option-btn";
        optBtn.textContent = option.label;
        optBtn.addEventListener("click", () => {
          this.selectOption(option);
        });
        optionsContainer.appendChild(optBtn);
      });

      view.appendChild(optionsContainer);
    } else {
      // End of conversation
      const endMsg = document.createElement("div");
      endMsg.className = "sf-end-message";
      endMsg.textContent = "Conversation ended. Click Restart to begin again.";
      view.appendChild(endMsg);
    }

    return view;
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.render();
  }

  editNode(nodeId) {
    this.editingNodeId = nodeId;
    const node = this.nodeMap[nodeId];

    // Show edit modal
    const modal = this.createEditModal(node);
    document.body.appendChild(modal);
  }

  createEditModal(node) {
    const modal = document.createElement("div");
    modal.className = "sf-modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "sf-modal";

    const header = document.createElement("h2");
    header.textContent = `Edit Node ${node.id}`;
    modalContent.appendChild(header);

    const form = document.createElement("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newText = textarea.value;
      node.text = newText;
      modal.remove();
      this.editingNodeId = null;
      this.render();
    });

    const label = document.createElement("label");
    label.textContent = "Node Text:";
    form.appendChild(label);

    const textarea = document.createElement("textarea");
    textarea.className = "sf-edit-textarea";
    textarea.value = node.text;
    textarea.rows = 5;
    form.appendChild(textarea);

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "sf-modal-buttons";

    const saveBtn = document.createElement("button");
    saveBtn.className = "sf-btn sf-btn-primary";
    saveBtn.textContent = "Save";
    saveBtn.type = "submit";
    buttonGroup.appendChild(saveBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "sf-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.type = "button";
    cancelBtn.addEventListener("click", () => {
      modal.remove();
      this.editingNodeId = null;
    });
    buttonGroup.appendChild(cancelBtn);

    form.appendChild(buttonGroup);
    modalContent.appendChild(form);

    modal.appendChild(modalContent);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
        this.editingNodeId = null;
      }
    });

    return modal;
  }

  selectOption(option) {
    // Add user response to history
    const currentNode = this.nodeMap[this.currentNodeId];
    this.previewHistory.push({
      type: "user",
      text: option.label,
    });

    // Move to next node
    this.currentNodeId = option.nextId;
    this.render();
  }

  toggleMode() {
    if (this.mode === "editor") {
      this.mode = "preview";
      this.currentNodeId = "1";
      this.previewHistory = [];
    } else {
      this.mode = "editor";
      this.editingNodeId = null;
    }
    this.render();
  }

  goBack() {
    if (this.previewHistory.length > 0) {
      this.previewHistory.pop(); // Remove last user action

      // Reconstruct current node from history
      this.currentNodeId = "1";
      const tempHistory = [...this.previewHistory];
      this.previewHistory = [];

      tempHistory.forEach((msg, index) => {
        if (msg.type === "user") {
          const node = this.nodeMap[this.currentNodeId];
          const option = node.options.find((opt) => opt.label === msg.text);
          if (option) {
            this.currentNodeId = option.nextId;
          }
        }
      });

      this.render();
    }
  }

  restartPreview() {
    this.currentNodeId = "1";
    this.previewHistory = [];
    this.render();
  }

  startDrag(e, node) {
    e.preventDefault();
    this.draggedNode = node;
    this.dragOffset = {
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    };

    document.addEventListener("mousemove", this.onDrag.bind(this));
    document.addEventListener("mouseup", this.stopDrag.bind(this));
  }

  onDrag(e) {
    if (!this.draggedNode) return;

    const canvas = this.container.querySelector(".sf-canvas");
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left - this.dragOffset.x;
    const y = e.clientY - rect.top - this.dragOffset.y;

    this.draggedNode.position.x = Math.max(
      0,
      Math.min(x, this.meta.canvas_size.w - 200),
    );
    this.draggedNode.position.y = Math.max(
      0,
      Math.min(y, this.meta.canvas_size.h - 60),
    );

    this.render();
  }

  stopDrag() {
    this.draggedNode = null;
    document.removeEventListener("mousemove", this.onDrag.bind(this));
    document.removeEventListener("mouseup", this.stopDrag.bind(this));
  }

  attachEditorListeners() {
    // Editor specific listeners
  }

  attachPreviewListeners() {
    // Preview specific listeners
  }
}
