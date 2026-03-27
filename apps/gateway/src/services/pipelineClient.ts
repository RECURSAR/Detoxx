import axios from "axios";

import { config } from "../config";
import { PipelineRequest, UnifiedMessage } from "../unified/types";

interface PipelineResponse {
  rewritten_text: string;
  provider_used: string;
  tokens_used: number;
}

export async function callPipeline(message: UnifiedMessage): Promise<string> {
  const payload: PipelineRequest = {
    message,
  };

  try {
    const response = await axios.post<PipelineResponse>(
      `${config.pipelineUrl}/rewrite`,
      payload,
      {
        timeout: 10000,
      },
    );

    return response.data.rewritten_text;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Pipeline request failed: ${error.message}`);
    }

    throw new Error("Pipeline request failed: unknown error");
  }
}
