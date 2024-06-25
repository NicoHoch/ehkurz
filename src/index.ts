import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readline from "readline";


dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let isAwaitingResponse = false;

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 1000
        }
    });

    async function askAndRespond() {
        if (!isAwaitingResponse) {
            rl.question("You: ", async (input) => {
                if (input === "exit") {
                    rl.close();
                } else {
                    isAwaitingResponse = true;
                    try {
                        const result = await chat.sendMessageStream(input);
                        let text = ""
                        for await (const chunk of result.stream) {
                            const chunkText = await chunk.text();
                            console.log("Gemini: ", chunkText);
                            text += chunkText;
                        }
                        isAwaitingResponse = false;
                        askAndRespond();

                    } catch (error) {
                        console.error(error);
                        isAwaitingResponse = false;
                    }

            }

            });
        } else {
            console.log("Gemini: I am still thinking, please wait...")
        }
    }

    askAndRespond();
}

run();