import path from 'path';
import { nodewhisper } from 'nodejs-whisper';

// Need to provide exact path to your audio file.
const filePath = 'C:/Users/Mohammed/dev/hackathon/Mumbai Hackathon/Education/ai.wav';

await nodewhisper(filePath, {
    modelName: 'base.en', //Downloaded models name
    autoDownloadModelName: 'base.en', // (optional) autodownload a model if model is not present
    verbose: true, // or false, depending on whether you want detailed logs
    removeWavFileAfterTranscription: true, // Set true or false based on preference
    withCuda: false, // (optional) use CUDA for faster processing
    whisperOptions: {
        outputInText: false, // get output result in txt file
        outputInVtt: false, // get output result in vtt file
        outputInSrt: true, // get output result in srt file
        outputInCsv: false, // get output result in csv file
        translateToEnglish: false, // translate from source language to English
        language: 'en', // source language
        wordTimestamps: false, // Word-level timestamps
        timestamps_length: 20, // amount of dialogue per timestamp pair
        splitOnWord: true, // split on word rather than on token
    },
});

// Model list
const MODELS_LIST = [
    'tiny',
    'tiny.en',
    'base',
    'base.en',
    'small',
    'small.en',
    'medium',
    'medium.en',
    'large-v1',
    'large',
];
