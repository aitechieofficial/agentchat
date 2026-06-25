export type Agent = {
  key: string;
  name: string;
  model: string;
  color: string;
  role: string;
};

export type CouncilMessage = {
  agent_key: string;
  agent_name: string;
  model: string;
  role: string;
  color: string;
  content: string;
};

export type AgentsResponse = {
  agents: Agent[];
  demo_mode: boolean;
};

export type CouncilResponse = {
  topic: string;
  messages: CouncilMessage[];
  demo_mode: boolean;
};
