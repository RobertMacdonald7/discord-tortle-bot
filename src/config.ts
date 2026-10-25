import dotenv from "dotenv";

dotenv.config();

const { APP_ID, DISCORD_TOKEN, NODE_ENV = "development" } = process.env;

if (!APP_ID || !DISCORD_TOKEN) {
  throw new Error("Missing required environment variables: APP_ID, DISCORD_TOKEN must be set");
}

export const config = {
  APP_ID,
  DISCORD_TOKEN,
  ENVIRONMENT: NODE_ENV,
};

function isDevelopment(): boolean {
  return config.ENVIRONMENT === "development";
}

/**
 * Returns the command name, optionally prefixed with "dev_" if in development environment.
 * @param name The base name of the command
 * @returns The command name, prefixed with "dev_" if in development environment
 */
export function commandName(name: string): string {
  return isDevelopment() ? `dev_${name}` : name;
}
