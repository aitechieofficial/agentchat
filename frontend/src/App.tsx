import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import { fetchAgents, runCouncil } from "./api";
import type { Agent, CouncilMessage } from "./types";
import "./styles.css";

const councilLayout = [
  { idleTop: "18%", idleLeft: "18%", huddleTop: "39%", huddleLeft: "39%", angle: "225deg" },
  { idleTop: "18%", idleLeft: "82%", huddleTop: "39%", huddleLeft: "61%", angle: "315deg" },
  { idleTop: "80%", idleLeft: "78%", huddleTop: "61%", huddleLeft: "61%", angle: "45deg" },
  { idleTop: "80%", idleLeft: "22%", huddleTop: "61%", huddleLeft: "39%", angle: "135deg" },
];

function escapeInitial(agent: Agent | undefined): string {
  return (agent?.name || agent?.model || "?").trim().charAt(0).toUpperCase();
}

function AgentCircle({
  agent,
  index,
  discussing,
  active,
}: {
  agent: Agent;
  index: number;
  discussing: boolean;
  active: boolean;
}) {
  const layout = councilLayout[index] ?? councilLayout[0];
  const top = discussing ? layout.huddleTop : layout.idleTop;
  const left = discussing ? layout.huddleLeft : layout.idleLeft;

  return (
    <div
      className={`agent-node ${active ? "active" : ""}`}
      data-agent={agent.key}
      style={
        {
          ["--node-color" as string]: agent.color,
          ["--node-top" as string]: top,
          ["--node-left" as string]: left,
          ["--line-angle" as string]: layout.angle,
        } as CSSProperties
      }
    >
      <div className="agent-face">{escapeInitial(agent)}</div>
      <span>{agent.name}</span>
      <small>{agent.model}</small>
    </div>
  );
}

function MessageCard({ message }: { message: CouncilMessage }) {
  return (
    <article className="message" style={{ ["--agent-color" as string]: message.color } as CSSProperties}>
      <div className="message-header">
        <div className="message-avatar" />
        <div className="message-meta">
          <strong>{message.agent_name}</strong>
          <span>
            {message.role} · {message.model}
          </span>
        </div>
      </div>
      <p>{message.content}</p>
    </article>
  );
}

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [demoMode, setDemoMode] = useState(true);
  const [topic, setTopic] = useState("");
  const [rounds, setRounds] = useState(1);
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Ready for a topic.");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runTokenRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchAgents(controller.signal)
      .then((response) => {
        setAgents(response.agents);
        setDemoMode(response.demo_mode);
      })
      .catch(() => {
        setStatus("Could not load agents.");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  const discussing = running || messages.length > 0;
  const stripAgents = useMemo(() => agents.slice(0, 4), [agents]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic || running) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const runToken = ++runTokenRef.current;

    setRunning(true);
    setStatus("Calling the council.");
    setMessages([]);

    try {
      const response = await runCouncil(cleanTopic, rounds, controller.signal);
      setDemoMode(response.demo_mode);
      setMessages([]);

      for (const message of response.messages) {
        if (runTokenRef.current !== runToken) {
          return;
        }
        setActiveAgent(message.agent_key);
        setStatus(`${message.agent_name} is contributing.`);
        await new Promise((resolve) => setTimeout(resolve, 320));
        if (runTokenRef.current !== runToken) {
          return;
        }
        setMessages((current) => [...current, message]);
      }

      if (runTokenRef.current !== runToken) {
        return;
      }
      setActiveAgent(null);
      setStatus(`Discussion complete: ${response.messages.length} council messages.`);
    } catch (error) {
      setActiveAgent(null);
      if (error instanceof Error && error.name !== "AbortError") {
        setStatus(error.message);
      }
    } finally {
      setRunning(false);
    }
  }

  function handleClear() {
    abortRef.current?.abort();
    runTokenRef.current += 1;
    setMessages([]);
    setActiveAgent(null);
    setStatus("Ready for a topic.");
    setRunning(false);
  }

  return (
    <main className="shell">
      <section className="visual-panel" aria-label="Agent activity visualization">
        <div className="brand-row">
          <div>
            <p className="eyebrow">LiteLLM Council</p>
            <h1>Agent Chat</h1>
          </div>
          <span className={`mode-pill ${demoMode ? "" : "live"}`}>{demoMode ? "Demo mode" : "LiteLLM live"}</span>
        </div>

        <div className={`space ${discussing ? "discussing" : ""}`} id="space">
          <div className="grid-layer" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="council-core" aria-hidden="true">
            <span />
          </div>
          {stripAgents.map((agent, index) => (
            <AgentCircle
              key={agent.key}
              agent={agent}
              index={index}
              discussing={discussing}
              active={activeAgent === agent.key}
            />
          ))}
        </div>

        <div className="agent-strip" id="agent-strip">
          {stripAgents.map((agent) => (
            <article className="agent-card" key={agent.key} style={{ ["--agent-color" as string]: agent.color } as React.CSSProperties}>
              <div className="swatch" />
              <div>
                <strong>{agent.name}</strong>
                <span>
                  {agent.role} · {agent.model}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="chat-panel" aria-label="Agent council chat">
        <form className="topic-form" onSubmit={handleSubmit}>
          <label htmlFor="topic">Topic</label>
          <div className="topic-row">
            <textarea
              id="topic"
              name="topic"
              rows={3}
              placeholder="Ask the council to discuss a product idea, decision, strategy, or research question."
              required
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
            <div className="controls">
              <label className="rounds-label" htmlFor="rounds">
                Rounds
              </label>
              <input
                id="rounds"
                name="rounds"
                type="number"
                min={1}
                max={3}
                value={rounds}
                onChange={(event) => setRounds(Number(event.target.value))}
              />
              <button type="submit" id="run-button" disabled={running} title="Start council discussion">
                <Play size={16} />
                <span>Run</span>
              </button>
            </div>
          </div>
        </form>

        <div className="status-row">
          <span id="status">{status}</span>
          <button type="button" id="clear-button" className="ghost-button" onClick={handleClear} title="Clear transcript">
            <RotateCcw size={15} />
            <span>Clear</span>
          </button>
        </div>

        <div className="messages" id="messages" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state">
              <strong>No discussion yet.</strong>
              <span>Enter a topic and the agents will discuss it as a council.</span>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageCard key={`${message.agent_key}-${index}`} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="panel-footnote">
          <Sparkles size={14} />
          <span>Each message shows the model alias currently assigned to that agent.</span>
        </div>
      </section>
    </main>
  );
}
