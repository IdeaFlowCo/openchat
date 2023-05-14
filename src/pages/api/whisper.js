// const { Configuration, OpenAIApi } = require("openai");
const FormData = require("form-data");
import { withFileUpload } from "next-multiparty";
import { createReadStream } from "fs";
import fetch from 'node-fetch';

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default withFileUpload(async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).send("No file uploaded");
        return;
    }

    // console.log("file", file);
    // Create form data
    const formData = new FormData();
    formData.append("file", createReadStream(file.filepath), "audio.wav");
    formData.append("model", "whisper-1");
    const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
            method: "POST",
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: formData,
        }
    );

    // const response = await openai.createTranscription(
    //     createReadStream(file.filepath),
    //     "whisper-1"
    // );

    const { text, error } = await response.json();
    if (response.ok) {
        res.status(200).json({ text: text });
    } else {
        console.log("OPEN AI ERROR:");
        console.log(error.message);
        res.status(400).json({ error: error.message });
    }
});
