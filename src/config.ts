import dotenv from "dotenv";

dotenv.config();

const { APP_ID, DISCORD_TOKEN } = process.env;

if (!APP_ID || !DISCORD_TOKEN) {
  throw new Error("Missing required environment variables: APP_ID and DISCORD_TOKEN must be set");
}

export const config = {
  APP_ID,
  DISCORD_TOKEN,
};
