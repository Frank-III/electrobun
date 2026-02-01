import { ChatMarkdownRenderer } from "../../../components/chat-markdown-renderer";
import { splitProps } from "solid-js";
interface ExitPlanModeToolPart {
	type: string;
	state: string;
	input?: Record<string, unknown>;
	output?: {
		plan?: string;
	};
}
interface AgentExitPlanModeToolProps {
	part: ExitPlanModeToolPart;
	chatStatus?: string;
}
export function AgentExitPlanModeTool(props: AgentExitPlanModeToolProps) {
	const [local] = splitProps(props, ["part", "chatStatus"]);
	// Plan is now shown in sidebar instead of inline
	// This component remains for potential future use
	return null;
}
