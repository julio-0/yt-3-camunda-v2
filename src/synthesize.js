const fs = require('fs');
const path = require('path');

const TextToSpeechV1 = require('ibm-watson/text-to-speech/V1');

const { IamAuthenticator } = require('ibm-watson/auth');

const credentials = require('./apikey-ibm-cloud-tts.json');

async function synthesize(txtFile, audio) {

    const textToConvert = fs.readFileSync(txtFile, 'utf8');

    const textToSpeech = new TextToSpeechV1({
        authenticator: new IamAuthenticator({
            apikey: credentials.apikey,
        }),
        serviceUrl: credentials.url,
    });

    const synthesizeParams = {
        text: textToConvert,
        accept: 'audio/wav',
        voice: 'pt-BR_IsabelaV3Voice',
    }

    await textToSpeech.synthesize(synthesizeParams)
    .then(response => {
        return textToSpeech.repairWavHeaderStream(response.result);
    })
    .then(buffer => {
        fs.writeFileSync(`${audio}.wav`, buffer);
    })
    .catch(err => {
        console.log('error: ', err);
    })
}

module.exports = synthesize;