const { Client, logger, Variables } = require('camunda-external-task-client-js');
const path = require('path');

const robots = {
    transcribe: require('./src/transcription'),
    synthesize: require('./src/synthesize'),
    getFiles: require('./src/scan'),
  }
  
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 20000 };
const client = new Client(config);

client.subscribe(`yt03_scan_videos`, async function({ task, taskService }) {
    await taskService.extendLock(task, 300000);
    console.log(`start task ${task.activityId}`);
    
    let videos = await robots.getFiles(path.join(__dirname, 'video'));
    console.log(videos);     

    //const localVariables = new Variables()
    const processVariables = new Variables();
    let str_list = JSON.stringify(videos);
    
    processVariables.setTyped('videos' ,{
        type: "object",      
        value: str_list,      
        valueInfo: { objectTypeName:"java.util.ArrayList", serializationDataFormat:"application/json" }      
      });
    // processVariables.set('run_synthesizer', true);
    //await taskService.handleBpmnError(task, "BPMNError_Code", "Error message", processVariables)            // criar processo ou tarefa

    await taskService.complete(task, processVariables);
});


client.subscribe(`yt03_scan_txt_files`, async function({ task, taskService }) {
    await taskService.extendLock(task, 300000);
    console.log(`start task ${task.activityId}`);
    
    let txtFiles = await robots.getFiles('./transcription');
    console.log(txtFiles);

    //const localVariables = new Variables()
    const processVariables = new Variables();
    let str_list = JSON.stringify(txtFiles);

    processVariables.setTyped('txtFiles' ,{
        type: "object",      
        value: str_list,      
        valueInfo: { objectTypeName:"java.util.ArrayList", serializationDataFormat:"application/json" }      
      });

    await taskService.complete(task, processVariables);
});


client.subscribe(`yt03_speech_to_text`, async function({ task, taskService }) {
    await taskService.extendLock(task, 300000);
    console.log(`start task ${task.activityId}`);

    let video = task.variables.get('video');
    console.log('video', video);
    const f = extractName(video);
    
    const audio = path.join(__dirname, 'audio', f.name + '.mp3');
    const txtFile = path.join(__dirname, 'transcription', f.name + '.txt') ;

    console.log('audio', audio);
    console.log('txt', txtFile);

    await robots.transcribe(video, audio, txtFile);

    await taskService.complete(task);
});

function extractName(mediafile){
    const name = path.basename(mediafile).split('.').shift();
    const dir = path.dirname(mediafile);
    const ext = path.extname(mediafile);
    
    // let parts = name.split('.')
    // const ext = parts.pop();
    // parts = parts.join('.').split('/');
    // const name = parts.pop();
    // const pth = parts.join('/');

    return { dir, name, ext };
}

client.subscribe(`yt03_text_to_speech`, async function({ task, taskService }) {
    await taskService.extendLock(task, 300000);
    console.log(`start task ${task.activityId}`);

    let txtFiles = task.variables.get('txtFiles');
    console.log('collection', txtFiles);

    let txtFile = task.variables.get('txtFile');
    console.log('txtFile', txtFile);

    const f = extractName(txtFile);
    
    const audio = path.join(__dirname, 'synthesis', f.name);

    await robots.synthesize(txtFile, audio);

    await taskService.complete(task);
});

