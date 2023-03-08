import inquirer from "inquirer";
import { Configuration, OpenAIApi } from "openai";
import { writeFile, appendFile } from "node:fs/promises";
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
      temperature,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens,
    });
    return completion.data.choices.map(({ text }) => text).join("");
  };
}

const getTimeString = () => moment().format("YYYY-MM-D_HH_mm_ss");

export const createTalk = (option) => {
  // ''
  return async function startTalk() {
    const file = join(process.cwd(), `${getTimeString()}.log`);
    const sayToAI = createSay(option);
    console.info(chalk.blue(`Start completion`));
    async function appendMsg(record) {
      const time = getTimeString();

      const { text, from } = record;
      await appendFile(file, `${from} ${time}\n${text.trim()}\n`);
    }

    await writeFile(file, ``);
    while (true) {
      const { your } = await prompt({ type: "input", name: "your" });
      await appendMsg({ from: "me", text: your });
      try {
        const ai = await sayToAI(your);
        console.info(chalk.green("ai:"), chalk.blue(ai));
        await appendMsg({ from: "ai", text: ai });
      } catch (e) {
        console.error(chalk.red("Open AI access error"));
        process.exit(-1);
      }
    }
    console.info(chalk.blue(`End completion`));
  };
};
