import inquirer from "inquirer";
import { Configuration, OpenAIApi } from "openai";
import { writeFile, appendFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "path";
import chalk from "chalk";
const prompt = inquirer.createPromptModule();
import moment from "moment";
function createSay({ apiKey, model, max_tokens, temperature }) {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);
  return async (text) => {
    const completion = await openai.createCompletion({
      model,
      prompt: text,
      temperature: Number(temperature),
      top_p: Number(1),
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: Number(max_tokens),
    });
    return completion.data.choices.map(({ text }) => text).join("");
  };
}

const getTimeString = () => moment().format("YYYY-MM-D_HH_mm_ss");

export const createTalk = (option) => {
  // ''

  const getCwdPath = (file) => {
    return join(process.cwd(), file);
  };

  return async function startTalk() {
    const file = getCwdPath(`${getTimeString()}.log`);

    let { saveKey, apiKey } = option;
    if (saveKey && apiKey) {
      await writeFile(getCwdPath("chatKey.key"), apiKey);
    }
    if (!apiKey) {
      apiKey = readFileSync(getCwdPath("chatKey.key")).toString();
      console.info(chalk.green("read local apikey"), apiKey);
    }
    if (!apiKey) {
      console.error(chalk.red("Apikey is required"));
    }
    const sayToAI = createSay({ ...option, apiKey });
    console.info(chalk.blue(`Start completion`));
    async function appendMsg(record) {
      const time = getTimeString();
      const { text, from } = record;
      await appendFile(file, `${from} ${time}\n${text.trim()}\n`);
    }

    const context = [];
    await writeFile(file, ``);
    while (true) {
      const { your } = await prompt({ type: "input", name: "your" });
      context.push(your);
      await appendMsg({ from: "me", text: your });
      try {
        const ai = await sayToAI(context.join("\n\n"));
        context.push(ai);
        console.info(chalk.green("ai:"), chalk.blue(ai));
        await appendMsg({ from: "ai", text: ai });
      } catch (e) {
        console.error(chalk.red("Open AI access error"), e.message);
        process.exit(-1);
      }
    }
    console.info(chalk.blue(`End completion`));
  };
};
