const multer = require('multer')
const client = require('socket.io').listen(4000).sockets;
const fs = require('fs');
var wavFileInfo = require('wav-file-info');
const ffmpeg = require('ffmpeg');
//const Blob = require('blob');


// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');


//console.log(process.env);


client.on('connection', (socket) =>{

    sendStatus = (s) => {//update status back to the client
        socket.emit('status', s);
    }

    socket.on('input', (audio) => {//notify the client of connection

        let inputAudio = audio;

        console.log('Client socket connected'); 
    })
    
    socket.on('audio', (blob) => {

        'use strict';
        
        console.log(blob);

        //ConvertFile(data);
        
        // [START speech_quickstart]
        async function main() {

        // Creates a client
        const client = new speech.SpeechClient();

        let buffer = Buffer.from(blob);
        let arraybuffer = Uint8Array.from(buffer).buffer;

        // if(fs.existsSync('test.wav')){
        //     fs.unlink('test.wav', function (err) {
        //         if (err) throw err;
        //         console.log('Previous File deleted!');
        //       });
        // }

        // fs.appendFile('audio.wav', data, function (err) {
        //     if (err) throw err;
        //     console.log('New File Saved!');
        //   });
       // fs.writeFileSync('test.wav', Buffer.from(new Uint8Array(data)));


        // The name of the audio file to transcribe
        const fileName = './resources/audio.raw';
        //ConvertFile(fileName);
        //const fileName = blobToFile(data, 'audio.wav');
    

        // Reads a local audio file and converts it to base64
        const file = fs.readFileSync(fileName);
        const audioBytes = file.toString('base64');

        //The audio file's encoding, sample rate in hertz, and BCP-47 language code
        const audio = {
            content: audioBytes,
        };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        };

        const request = {
            audio: audio,
            config: config,
        };

        // Detects speech in the audio file
        const [response] = await client.recognize(request);
        const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
        console.log(`Transcription: ${transcription}`);

        //Emit transcription to the client
        socket.emit('output', transcription);
        }
        main().catch(console.error);
        // [END speech_quickstart]
    });

});//END OF CONNECTION SECTION


// function blobToFile(theBlob, fileName){
//     //A Blob() is almost a File() - it's just missing the two properties below which we will add
//     theBlob.lastModifiedDate = new Date();
//     theBlob.name = fileName;
//     return theBlob;
// }

// function DisplayFileInfo(fileName){
//     wavFileInfo.infoByFilename(`./${fileName}`, function(err, info){
//         if (err) throw err;
//         console.log(info);
//       });
// }

function ConvertFile(blob){
    console.log('Conversion started...')
     try{
        var process = new ffmpeg(`./${blob}`);

        process.then((audio) => {
            //callback mode
            audio.fnExtractSoundToMP3('./resources/file.mp3', (err, file) => {
                if(!err){
                    console.log(`Audio file: ${file}`)
                }
                console.log(file);
            });
        }, (err) => {
            console.log(`Error: ${err}`);
        });
    }
    catch(e){
        console.log(`Caught Code: ${e.code}`)
        console.log(`Caught Message: ${e.msg}`)
    }
}