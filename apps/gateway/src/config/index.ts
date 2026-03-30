import dotenv from "dotenv";
import path from "path";

// .env lives at the monorepo root (four directories up from apps/gateway/src/config/)
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

interface Config {
  slackBotToken: string;
  slackSigningSecret: string;
  teamsAppId: string;
  teamsAppPassword: string;
  pipelineUrl: string;
  port: number;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const config: Config = {
  slackBotToken: required("SLACK_BOT_TOKEN"),
  slackSigningSecret: required("SLACK_SIGNING_SECRET"),
  teamsAppId: required("TEAMS_APP_ID"),
  teamsAppPassword: required("TEAMS_APP_PASSWORD"),
  pipelineUrl: required("PIPELINE_URL"),
  port: Number(process.env.PORT ?? "3000"),
};
