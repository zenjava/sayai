#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();
import { createTalk } from "../index.mjs";
program.name("sayai").description("开启智能之旅!").version("1.0.0");

program
  .command("start")
  .description("开始对话")
  .requiredOption("-key, --apiKey <string>", "openAI的密钥")
  .option("-m, --model <string>", "选择GPT模型", "text-davinci-003")
  .option("-max, --max_tokens <number>", "最大返回文本数", 256)
  .option("--temperature <number>", "温度", 0.7)
  .action((options) => {
    const { apiKey } = options;
    console.info(options);
    createTalk(options)();
  });

program.parse();
