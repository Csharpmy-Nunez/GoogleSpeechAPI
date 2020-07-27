let constraintObj = { 
    audio: true, 
    video: false
}; 


var element = (id) => {
    return document.getElementById(id);
}
// width: 1280, height: 720  -- preference only
// facingMode: {exact: "user"}
// facingMode: "environment"

//handle older browsers that might implement getUserMedia in some way
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
    navigator.mediaDevices.getUserMedia = function(constraintObj) {
        let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraintObj, resolve, reject);
        });
    }
}else{
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        devices.forEach(device=>{
            console.log(device.kind.toUpperCase(), device.label);
            //, device.deviceId
        })
    })
    .catch(err=>{
        console.log(err.name, err.message);
    })
}

navigator.mediaDevices.getUserMedia(constraintObj).then(function(mediaStreamObj) {

    const socket = io('ws://localhost:4000');
    if(socket !== undefined){
        console.log('Connection was successful');

            //connect the media stream to the first video element
            let audio = element('player');
            if ("srcObject" in audio) {
                audio.srcObject = mediaStreamObj;
            } else {
                //old version
                audio.src = window.URL.createObjectURL(mediaStreamObj);
            }
            
            audio.onloadedmetadata = function(ev) {
                //show in the video element what is being captured by the webcam
                audio.play();
            };
            
            //add listeners for saving video/audio
            let start = document.getElementById('start');
            let stop = document.getElementById('stop');
            let audioSave = document.getElementById('player');
            let mediaRecorder = new MediaRecorder(mediaStreamObj);
            let chunks = [];
            
            start.addEventListener('click', (ev)=>{
                if(mediaRecorder.state === 'inactive'){
                    mediaRecorder.start();
                    console.log(`Status: ${mediaRecorder.state}`);
                }
            })

            stop.addEventListener('click', (ev)=>{
                if(mediaRecorder.state === 'recording'){
                    mediaRecorder.stop();
                    console.log(`Status: ${mediaRecorder.state}`);
                }
            });

            mediaRecorder.ondataavailable = function(ev) {
                chunks.push(ev.data);
                console.log( ev.data);
            }

            mediaRecorder.onstop = (ev)=>{
                let blob = new Blob(chunks, {'type' : 'audio/wav'});

                
                //send the file to the server
                socket.emit('audio', blob);

                //console.log(`Sent to the server: ${blob.size}`);
                console.log(blob);

                chunks = [];
                let audioURL = window.URL.createObjectURL(blob);
                audioSave.src = audioURL;

                //Display the transcription text sent by the server
                socket.on('output', (data) => {
                    transcription.textContent = data;
                });
            }
    }//END OF CONNECTION INCEPTION

}).catch(function(err) { console.log(err.name, err.message); });


