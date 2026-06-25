const agentStrip = document.querySelector("#agent-strip");
const messagesEl = document.querySelector("#messages");
const form = document.querySelector("#topic-form");
const topicInput = document.querySelector("#topic");
const roundsInput = document.querySelector("#rounds");
const runButton = document.querySelector("#run-button");
const clearButton = document.querySelector("#clear-button");
const statusEl = document.querySelector("#status");
const modePill = document.querySelector("#mode-pill");
const spaceEl = document.querySelector("#space");

let agents = [];

const nodeLayout = [
  { idleTop: "17%", idleLeft: "18%", huddleTop: "39%", huddleLeft: "39%", angle: "225deg" },
  { idleTop: "18%", idleLeft: "82%", huddleTop: "39%", huddleLeft: "61%", angle: "315deg" },
  { idleTop: "80%", idleLeft: "77%", huddleTop: "61%", huddleLeft: "61%", angle: "45deg" },
  { idleTop: "78%", idleLeft: "21%", huddleTop: "61%", huddleLeft: "39%", angle: "135deg" },
];

function setStatus(text) {
  statusEl.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function agentInitial(agent) {
  return (agent.name || agent.model || "?").trim().charAt(0).toUpperCase();
}

function setActiveAgent(agentKey) {
  document.querySelectorAll(".agent-node").forEach((node) => {
    node.classList.toggle("active", node.dataset.agent === agentKey);
  });
}

function setDiscussing(isDiscussing) {
  spaceEl.classList.toggle("discussing", isDiscussing);
}

function renderAgentVisualization() {
  spaceEl.querySelectorAll(".agent-node, .signal-line").forEach((element) => element.remove());

  agents.slice(0, 4).forEach((agent, index) => {
    const layout = nodeLayout[index];
    const line = document.createElement("div");
    line.className = "signal-line";
    line.style.setProperty("--line-angle", layout.angle);
    spaceEl.appendChild(line);

    const node = document.createElement("div");
    node.className = "agent-node";
    node.dataset.agent = agent.key;
    node.style.setProperty("--node-color", agent.color);
    node.style.setProperty("--idle-top", layout.idleTop);
    node.style.setProperty("--idle-left", layout.idleLeft);
    node.style.setProperty("--huddle-top", layout.huddleTop);
    node.style.setProperty("--huddle-left", layout.huddleLeft);
    node.style.animationDelay = `${index * -1.1}s`;
    node.innerHTML = `
      <div class="agent-face">${escapeHtml(agentInitial(agent))}</div>
      <span>${escapeHtml(agent.name)}</span>
      <small>${escapeHtml(agent.model)}</small>
    `;
    spaceEl.appendChild(node);
  });
}

function renderAgents() {
  agentStrip.innerHTML = agents
    .map(
      (agent) => `
        <article class="agent-card" style="--agent-color: ${agent.color}">
          <div class="swatch"></div>
          <div>
            <strong>${escapeHtml(agent.name)}</strong>
            <span>${escapeHtml(agent.role)} · ${escapeHtml(agent.model)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function clearMessages() {
  messagesEl.innerHTML = `
    <div class="empty-state">
      <strong>No discussion yet.</strong>
      <span>Enter a topic and the configured agents will discuss it as a council.</span>
    </div>
  `;
}

function createMessage(message, pending = false) {
  const article = document.createElement("article");
  article.className = `message${pending ? " pending" : ""}`;
  article.style.setProperty("--agent-color", message.color);
  article.innerHTML = `
    <div class="message-header">
      <div class="message-avatar"></div>
      <div class="message-meta">
        <strong>${escapeHtml(message.agent_name)}</strong>
        <span>${escapeHtml(message.role)} · ${escapeHtml(message.model)}</span>
      </div>
    </div>
    <p></p>
  `;
  article.querySelector("p").textContent = message.content;
  return article;
}

async function replayMessages(messages) {
  messagesEl.innerHTML = "";
  setDiscussing(true);
  for (const message of messages) {
    setActiveAgent(message.agent_key);
    setStatus(`${message.agent_name} is contributing.`);
    const pending = createMessage({ ...message, content: "Thinking" }, true);
    messagesEl.appendChild(pending);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    await new Promise((resolve) => setTimeout(resolve, 450));
    pending.replaceWith(createMessage(message));
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  setActiveAgent("");
  setDiscussing(false);
}

async function loadAgents() {
  const response = await fetch("/api/agents");
  if (!response.ok) {
    throw new Error("Could not load agents.");
  }
  const data = await response.json();
  agents = data.agents;
  modePill.textContent = data.demo_mode ? "Demo mode" : "LiteLLM live";
  modePill.classList.toggle("live", !data.demo_mode);
  renderAgentVisualization();
  renderAgents();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const topic = topicInput.value.trim();
  const rounds = Number(roundsInput.value || 1);
  if (!topic) return;

  runButton.disabled = true;
  setStatus("Calling the council.");
  setActiveAgent(agents[0]?.key || "");
  setDiscussing(true);

  try {
    const response = await fetch("/api/council", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, rounds }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Council request failed.");
    }
    modePill.textContent = data.demo_mode ? "Demo mode" : "LiteLLM live";
    modePill.classList.toggle("live", !data.demo_mode);
    await replayMessages(data.messages);
    setStatus(`Discussion complete: ${data.messages.length} council messages.`);
  } catch (error) {
    setActiveAgent("");
    setDiscussing(false);
    setStatus(error.message);
  } finally {
    runButton.disabled = false;
  }
});

clearButton.addEventListener("click", () => {
  clearMessages();
  setActiveAgent("");
  setDiscussing(false);
  setStatus("Ready for a topic.");
});

loadAgents().catch((error) => {
  setStatus(error.message);
});
