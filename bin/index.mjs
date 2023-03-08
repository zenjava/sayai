#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();
import { createTalk } from "../index.mjs";
program.name("sayai").description("say to chatGPT").version("1.0.0");

program
  .command("start")
  .description("Start completion")
  .requiredOption("-key, --apiKey <string>", "openAI的密钥")
  .option("-m, --model <string>", "Select chatGPT model ", "text-davinci-003")
  .option("-max, --max_tokens <number>", "Return max characters", 256)
  .option("--temperature <number>", "temperature", 0.7)
  .action((options) => {
    const { apiKey } = options;
    console.info(options);
    createTalk(options)();
  });

program.parse();
