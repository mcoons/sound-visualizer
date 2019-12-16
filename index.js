// var frObjects = [];
var soundData;
var spheres;
var scene;


window.onload = function () {

  // Check support
  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  } else {
    // Babylon is supported
    var canvas = document.getElementById("canvas");

    var arraySize = 60;
    soundData = initializeSoundData();

    var palette = [];

    var frObjects = [];
    // var tdPoints = [];
    var tdPoints2 = [];
    // var tdSoundWave = [];
    var tdSoundWave2 = [];
    var frBufferLength, tdBufferLength, frAnalyserNode, tdAnalyserNode;

    spheres = [];

    var ground;
    var groundVertices = [];
    var colorsBuffer = [];

    initializeSoundDevices();

    var performUpdates = true;


    var player;
    player = document.getElementById('music_player');
    
    var engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    // Main animation loop
    engine.runRenderLoop(function () {
      if (performUpdates) updateScene();
      scene.render();
    });

    // Resize
    window.addEventListener("resize", function () {
      engine.resize();
    });
  }

  function updateScene() {

    analyzeData();

    // --- DATA RANGES ---
    //  fr   {-180, -12}
    //  buckets range from 0 hertz to 24000 hertz.
    //  td   {-1, 1}
    // colors {0, 1529}
    // map(currentValue, originalMin, originalMax, newMin, newMax)

    // 20-80Hz
    // 80-160Hz   Bass
    // 160-500Hz
    // 500Hz-1.6kHz
    // 1.6-4kHz
    // 4-10kHz
    // 10kHz+

    // update frequency graph objects
    frObjects.forEach((object, index) => {
      object.scaling.y = (soundData.frBuffer[index] + 140) * .2;
      // let newY = ((soundData.frBuffer[index] + 140) * .2);
      // object.scaling.y = newY*newY/20;
      object.material = palette[Math.round(map(soundData.frBuffer[index] < -180 ? -180 : soundData.frBuffer[index], -180, -10, 0, 1529))].mat;

    });

    // // update sound wave time data points and line
    // tdPoints.forEach((point, index) => {
    //   point.y = 40 + soundData.tdBuffer[index] * 10;
    // });
    // tdSoundWave = BABYLON.MeshBuilder.CreateLines("tdSoundWave", {
    //   points: tdPoints,
    //   instance: tdSoundWave
    // });

    // mirror of above sound wave data 
    tdPoints2.forEach((point, index) => {
      point.y = -20 + soundData.tdBuffer[index] * 10;
    });
    tdSoundWave2 = BABYLON.MeshBuilder.CreateLines("tdSoundWave", {
      points: tdPoints2,
      instance: tdSoundWave2
    });

    // // update top spheres
    // spheres[0].scaling = new BABYLON.Vector3(3 * (soundData.tdAvgTotalMaxs), 3 * (soundData.tdAvgTotalMaxs), 3 * (soundData.tdAvgTotalMaxs));
    // spheres[1].scaling = new BABYLON.Vector3(3 * (soundData.tdAvgTotalMins), 3 * (soundData.tdAvgTotalMins), 3 * (soundData.tdAvgTotalMins));
    // spheres[2].scaling = new BABYLON.Vector3(Math.abs(1 - 100 * (soundData.tdAvgTotalAvgs)), Math.abs(1 - 100 * (soundData.tdAvgTotalAvgs)), Math.abs(1 - 100 * (soundData.tdAvgTotalAvgs)));
    // spheres[3].scaling = new BABYLON.Vector3(2 * (soundData.tdAvgTotalRanges), 2 * (soundData.tdAvgTotalRanges), 2 * (soundData.tdAvgTotalRanges));
    // spheres[4].scaling = new BABYLON.Vector3(1 + .5 * (soundData.tdMin.value), 1 + .5 * (soundData.tdMin.value), 1 + .5 * (soundData.tdMin.value));
    // spheres[5].scaling = new BABYLON.Vector3(1 + .5 * (soundData.tdMax.value), 1 + .5 * (soundData.tdMax.value), 1 + .5 * (soundData.tdMax.value));
    // spheres[6].scaling = new BABYLON.Vector3(1 + 10 * (soundData.tdAvg), 1 + 10 * (soundData.tdAvg), 1 + 10 * (soundData.tdAvg));
    // spheres[7].scaling = new BABYLON.Vector3(1 + .5 * (soundData.tdRange), 1 + .5 * (soundData.tdRange), 1 + .5 * (soundData.tdRange));

    // spheres[8].scaling = new BABYLON.Vector3(.03 * (soundData.frAvgTotalMaxs), .03 * (soundData.frAvgTotalMaxs), .03 * (soundData.frAvgTotalMaxs));
    // spheres[9].scaling = new BABYLON.Vector3(.01 * (soundData.frAvgTotalMins), .01 * (soundData.frAvgTotalMins), .01 * (soundData.frAvgTotalMins));
    // spheres[10].scaling = new BABYLON.Vector3(Math.abs(.01 * (soundData.frAvgTotalAvgs)), Math.abs(.01 * (soundData.frAvgTotalAvgs)), Math.abs(.01 * (soundData.frAvgTotalAvgs)));
    // spheres[11].scaling = new BABYLON.Vector3(.01 * (soundData.frAvgTotalRanges), .01 * (soundData.frAvgTotalRanges), .01 * (soundData.frAvgTotalRanges));
    // spheres[12].scaling = new BABYLON.Vector3(.03 * (soundData.frMax.value), .03 * (soundData.frMax.value), .03 * (soundData.frMax.value));
    // spheres[13].scaling = new BABYLON.Vector3(.01 * (soundData.frMin.value), .01 * (soundData.frMin.value), .01 * (soundData.frMin.value));
    // spheres[14].scaling = new BABYLON.Vector3(.01 * (soundData.frAvg), .01 * (soundData.frAvg), .01 * (soundData.frAvg));
    // spheres[15].scaling = new BABYLON.Vector3(.01 * (soundData.frRange), .01 * (soundData.frRange), .01 * (soundData.frRange));

    // // update bottom spheres
    // spheres[16].scaling = new BABYLON.Vector3(2 - .5 * Math.abs(spheres[0].scaling.x - spheres[1].scaling.x), 2 - .5 * Math.abs(spheres[0].scaling.x - spheres[1].scaling.x), 2 - .5 * Math.abs(spheres[0].scaling.x - spheres[1].scaling.x));
    // spheres[17].scaling = new BABYLON.Vector3(2 * Math.sin(soundData.frAvgTotalAvgs), 2 * Math.sin(soundData.frAvgTotalAvgs), 2 * Math.sin(soundData.frAvgTotalAvgs));
    // spheres[18].scaling = new BABYLON.Vector3(3 * Math.sin(soundData.tdAvgTotalMins), 3 * Math.sin(soundData.tdAvgTotalMins), 3 * Math.sin(soundData.tdAvgTotalMins));



    // update 3D plane
    let h = frBufferLength;
    let w = soundData.frBufferHistory.length;

    let groundVertices = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    let vertexDataIndex = 0;

    let colorsBuffer = [];
    let data = {};

    for (x = 0; x < w; x++) {
    for (y = 0; y < h; y++) {
        let currentData = soundData.frBufferHistory[x];

        let c = palette[Math.round(map(currentData[y] < -180 ? -180 : currentData[y], -180, -12, 0, 1529))].mat.diffuseColor;
          // set color for 3D babylonjs canvas (0-1)
          colorsBuffer.push(c.r);
          colorsBuffer.push(c.g);
          colorsBuffer.push(c.b);
          colorsBuffer.push(1);

          // set y value of ground vertex data
          groundVertices[vertexDataIndex + 1] = (180-Math.abs(currentData[y]))/10 -4.5;
          // let newY = ((currentData[y] + 140) * .2);
          // groundVertices[vertexDataIndex + 1] =  newY*newY/20;

          vertexDataIndex = vertexDataIndex + 3;
      }
  }

    // update the 3D babylon ground plane
    ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, groundVertices);
    ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorsBuffer);

  }

  function createScene() {
    var scene = new BABYLON.Scene(engine);
    buildPalette();
    // Parameters: camera, alpha(x), beta(y), radius, target position, scene
    var camera1 = new BABYLON.ArcRotateCamera("camera1", 3 * Math.PI / 2, Math.PI / 3, 120, new BABYLON.Vector3(0, 0, 0), scene);

    // Attach controls to cameras
    camera1.attachControl(canvas, true);

    // Add cameras to scene
    scene.activeCameras.push(camera1);

    // Add lights to scene
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(-50, 80, -500), scene);
    // light2.intensity = .5;

    var light1 = new BABYLON.PointLight("light1", new BABYLON.Vector3(500, 500, 500), scene);
    // light1.intensity = .2;





    // build 3D ground
    ground = BABYLON.Mesh.CreateGround('ground1', 1, 1, frBufferLength-1, scene, true);
    ground.material = new BABYLON.StandardMaterial("gmat", scene);
    // ground.material.diffuseColor = palette[100].color;
    ground.material.backFaceCulling = false;
    ground.material.specularColor = new BABYLON.Color3(0, 0, 0);  // black is no shine

    ground.position.x -= .2;
    ground.position.z = 64;
    ground.scaling = new BABYLON.Vector3(128,1,128);

    // update 3D plane

    // let groundVertices = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    // let vertexDataIndex = 0;

    // let colorsBuffer = [];
    // let data = {};

    for (x = 0; x < 256; x++) {
      let currentData = [];
    for (y = 0; y < 256; y++) {
        currentData.push(-180);

      }
      soundData.frBufferHistory.push(currentData);
  }

    // // update the 3D babylon ground plane
    // ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, groundVertices);
    // ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorsBuffer);


    // Add background layer to scene
    // var layer = new BABYLON.Layer('','https://i.imgur.com/mBBxGJH.jpg', scene, true);

    // Create the bars for the frequency graph
    for (let i = 0; i < frBufferLength; i++) {
      let thing = BABYLON.MeshBuilder.CreateBox("box" + i, {
        width: .5,
        depth: .21
      }, scene);
      // var thing = BABYLON.MeshBuilder.CreateCylinder("bar"+i, {diameter:.5, tessellation: 8}, scene);
      thing.material = palette[i].mat;
      thing.position = new BABYLON.Vector3(-frBufferLength * 1 / 4 + i * .5, 0, 0);
      frObjects.push(thing);
    }

    // // Initialize points for TOP sound wave time data
    // for (let i = 0; i < tdBufferLength; i++) {
    //   var point = new BABYLON.Vector3(-tdBufferLength * 1 / 4 + i * 1 / 4 + 64, 30, -.51);
    //   tdPoints.push(point);
    // }

    // // Plot initial TOP sound wave 
    // tdSoundWave = BABYLON.MeshBuilder.CreateLines("tdSoundWave", {
    //   points: tdPoints,
    //   updatable: true
    // }, scene);

    // Initialize points for BOTTOM sound wave time data
    for (let i = 0; i < tdBufferLength; i++) {
      var point = new BABYLON.Vector3(-tdBufferLength * 1 / 4 + i * 1 / 4 + 64, -30, -.51);
      tdPoints2.push(point);
    }

    // Plot initial BOTTOM sound wave 
    tdSoundWave2 = BABYLON.MeshBuilder.CreateLines("tdSoundWave", {
      points: tdPoints2,
      updatable: true
    }, scene);

    // // Create spheres to manipulate with soundData
    // for (let i = 0; i <= 15; i++) {
    //   var thing1 = BABYLON.MeshBuilder.CreateSphere("sphere" + i, {
    //     diameter: 5,
    //     tessellation: 8
    //   }, scene);
    //   thing1.position = new BABYLON.Vector3(i * 8 - 60, -35, 0);
    //   thing1.material = palette[i * 45].mat;
    //   spheres.push(thing1);
    // }
    // for (let i = 0; i <= 15; i++) {

    //   var thing2 = BABYLON.MeshBuilder.CreateSphere("sphere" + i, {
    //     diameter: 5,
    //     tessellation: 8
    //   }, scene);
    //   thing2.position = new BABYLON.Vector3(i * 8 - 60, -50, 0);
    //   thing2.material = palette[45 * 16 + i * 45].mat;
    //   spheres.push(thing2);
    // }

    return scene;
  }

  // Returns soundData object
  function initializeSoundData() {

    // Main data object for sound data
    var soundData = {

      // Sound Wave Time Domain Data  ////////////////////////
      tdBuffer: [], // Raw td data for this frame
      tdBufferHistory: [], 

      // this frames data
      tdMax: {
        index: 0,
        value: 0
      },
      tdMin: {
        index: 0,
        value: 0
      },
      tdTot: 0,
      tdAvg: 0,

      // history of frame data 
      tdMaxs: [], // {location, value}
      tdMins: [], // {location, value}
      tdAvgs: [],
      tdRanges: [],

      // history averages
      tdAvgTotalMaxs: 0,
      tdAvgTotalMins: 0,
      tdAvgTotalAvgs: 0,
      tdAvgTotalRanges: 0,

      // All Time highs
      tdMaxAllTime: -500,
      tdMinAllTime: 500,


      // Frequency Data ////////////////////////
      frBuffer: [], // Raw fr data
      frBufferHistory: [],

      // this frames data
      frMax: {
        index: 0,
        value: 0
      },
      frMin: {
        index: 0,
        value: 0
      },
      frTot: 0,
      frAvg: 0,

      // history of frame data     
      frMaxs: [],
      frMins: [],
      frAvgs: [],
      frRanges: [],

      // history averages
      frAvgTotalMaxs: 0,
      frAvgTotalMins: 0,
      frAvgTotalAvgs: 0,
      frAvgTotalRanges: 0,

      // All Time highs
      frMaxAllTime: -500,
      frMinAllTime: 500
    };

    // Initialize 
    soundData.tdMaxs = Array(arraySize).fill({
      index: 0,
      value: 0
    });

    soundData.tdMins = Array(arraySize).fill({
      index: 0,
      value: 0
    });

    for (let index = 0; index < frBufferLength; index++) {

      let frTemp = [];
      frTemp = Array(frBufferLength).fill(0);
      soundData.frBufferHistory.push(frTemp);
    }

    soundData.tdAvgs = Array(arraySize).fill(0);
    soundData.tdRanges = Array(arraySize).fill(0);

    soundData.frMaxs = Array(arraySize).fill(0);
    soundData.frMins = Array(arraySize).fill(0);
    soundData.frAvgs = Array(arraySize).fill(0);
    soundData.frRanges = Array(arraySize).fill(0);


    return soundData;
  }

  // Sets up sound devices
  function initializeSoundDevices() {
    var audioCtx = new AudioContext();

    //Create audio source
    //Here, we use an audio file, but this could also be e.g. microphone input
    var audioEle = document.getElementById('music_player');



    // audioEle.src = './assets/sounds/Tones-01.m4a';//insert file name here
    // audioEle.src = './assets/sounds/my-rec.mp3';//insert file name here
    // audioEle.src = './assets/sounds/my-audio9.mp3'; //insert file name here
    // audioEle.src = './assets/sounds/Lola.MP3'; //insert file name here
    // audioEle.src = './assets/sounds/La Bamba.mp3'; //insert file name here
    // audioEle.src = './assets/sounds/Comfortably Numb.mp3'; //insert file name here
    // audioEle.src = './assets/sounds/The Unforgiven.mp3'; //insert file name here
    // audioEle.src = './assets/sounds/Born To Be Wild.mp3'; //insert file name here
    audioEle.src = './assets/sounds/Dust in the wind.mp3'; //insert file name here




    audioEle.preload = 'auto';
    audioEle.autoplay = true;
    audioEle.loop = true;
    var audioSourceNode = audioCtx.createMediaElementSource(audioEle);

    // Create frequency analyser node
    // Visualized with a bar graph
    frAnalyserNode = audioCtx.createAnalyser();
    frAnalyserNode.fftSize = 512; //  power of 2 between 2^5 and 2^15,
    frAnalyserNode.maxDecibels = -45;
    frAnalyserNode.minDecibels = -50;
    frAnalyserNode.smoothingTimeConstant = 0.85;
    frBufferLength = frAnalyserNode.frequencyBinCount;
    soundData.frBuffer = new Float32Array(frBufferLength);

    //Create time analyser node
    tdAnalyserNode = audioCtx.createAnalyser();
    tdAnalyserNode.fftSize = 1024;
    tdAnalyserNode.maxDecibels = -45;
    tdAnalyserNode.minDecibels = -50;
    tdAnalyserNode.smoothingTimeConstant = 0.75;
    tdBufferLength = tdAnalyserNode.frequencyBinCount;
    soundData.tdBuffer = new Float32Array(tdBufferLength);

    //Set up audio node network
    audioSourceNode.connect(frAnalyserNode);
    frAnalyserNode.connect(tdAnalyserNode);
    tdAnalyserNode.connect(audioCtx.destination);

    //
    let susresBtn = document.querySelector('#start')
    susresBtn.onclick = function (event) {
      // event.preventDefault();
      console.info('Button pressed')
      if (audioCtx.state === 'running') {
        audioCtx.suspend().then(function () {
          susresBtn.textContent = 'Resume';
          performUpdates = false;
        });
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(function () {
          susresBtn.textContent = 'Pause';
          performUpdates = true;
        });
      } else {
        console.error("Unhandled audioCtx.state:", audioCtx.state);
      }
    }

  }

  // Anlyze Frequency and Time Domain samples for this frame
  function analyzeData() {
    let tdMaxsTotal = tdMinsTotal = tdAvgsTotal = tdTotalRanges = 0;
    let frTotalMaxs = frTotalMins = frTotalAvgs = frTotalRanges = 0;

    frAnalyserNode.getFloatFrequencyData(soundData.frBuffer);
    soundData.frBufferHistory.push(soundData.frBuffer.slice(0));
    if (soundData.frBufferHistory.length > frBufferLength) soundData.frBufferHistory.shift();

    tdAnalyserNode.getFloatTimeDomainData(soundData.tdBuffer);
    // soundData.tdBufferHistory.push(soundData.tdBuffer.slice(0));
    // if (soundData.tdBufferHistory.length > tdBufferLength) soundData.tdBufferHistory.shift();

    // Calculate sound wave time data min and max and get total for averaging
    //  td   {-1, 1}
    soundData.tdMax = {
      index: 0,
      value: -500
    };
    soundData.tdMin = {
      index: 0,
      value: 500
    };
    soundData.tdTot = 0;

    // for (let i = 0; i < tdBufferLength; i++) {
    //   if (soundData.tdBuffer[i] > soundData.tdMax.value) soundData.tdMax = {
    //     index: i,
    //     value: soundData.tdBuffer[i]
    //   };
    //   if (soundData.tdBuffer[i] < soundData.tdMin.value) soundData.tdMin = {
    //     index: i,
    //     value: soundData.tdBuffer[i]
    //   };
    //   soundData.tdTot += soundData.tdBuffer[i];

    //   if (soundData.tdBuffer[i] > soundData.tdMaxAllTime) soundData.tdMaxAllTime = soundData.tdBuffer[i];
    //   if (soundData.tdBuffer[i] < soundData.tdMinAllTime) soundData.tdMinAllTime = soundData.tdBuffer[i];

    // }

    // soundData.tdMaxs.push(soundData.tdMax);
    // if (soundData.tdMaxs.length > arraySize) soundData.tdMaxs.shift();

    // soundData.tdMins.push(soundData.tdMin);
    // if (soundData.tdMins.length > arraySize) soundData.tdMins.shift();

    // // Calculate average
    // soundData.tdAvg = soundData.tdTot / tdBufferLength;
    // soundData.tdAvgs.push(soundData.tdAvg);
    // if (soundData.tdAvgs.length > arraySize) soundData.tdAvgs.shift();

    // // Calculate range
    // soundData.tdRange = soundData.tdMax.value - soundData.tdMin.value;
    // soundData.tdRanges.push(soundData.tdRange);
    // if (soundData.tdRanges.length > arraySize) soundData.tdRanges.shift();



    // Calculate frequency min and max and get total for averaging
    //  fr   {-180, -12 }
    // soundData.frMax = {
    //   index: 0,
    //   value: -500
    // };
    // soundData.frMin = {
    //   index: 0,
    //   value: 500
    // };
    // soundData.frTot = 0;

    // for (let i = 0; i < frBufferLength; i++) {
    //   if (soundData.frBuffer[i] > soundData.frMax.value) soundData.frMax = {
    //     index: i,
    //     value: soundData.frBuffer[i]
    //   };
    //   if (soundData.frBuffer[i] < soundData.frMin.value) soundData.frMin = {
    //     index: i,
    //     value: soundData.frBuffer[i]
    //   };
    //   soundData.frTot += soundData.frBuffer[i];

    //   if (soundData.frBuffer[i] > soundData.frMaxAllTime) soundData.frMaxAllTime = soundData.frBuffer[i];
    //   if (soundData.frBuffer[i] < soundData.frMinAllTime && soundData.frBuffer[i] > -100000) soundData.frMinAllTime = soundData.frBuffer[i];
    // }

    // soundData.frMaxs.push(soundData.frMax);
    // if (soundData.frMaxs.length > arraySize) soundData.frMaxs.shift();

    // soundData.frMins.push(soundData.frMin);
    // if (soundData.frMins.length > arraySize) soundData.frMins.shift();

    // // Calculate average 
    // soundData.frAvg = soundData.frTot / frBufferLength;
    // soundData.frAvgs.push(soundData.frAvg);
    // if (soundData.frAvgs.length > arraySize) soundData.frAvgs.shift();

    // // Calculate range
    // soundData.frRange = soundData.frMax.value - soundData.frMin.value;
    // soundData.frRanges.push(soundData.frRange);
    // if (soundData.frRanges.length > arraySize) soundData.frRanges.shift();


    // 

    // for (let index = 0; index < arraySize; index++) {
    //   tdMaxsTotal += soundData.tdMaxs[index].value;
    //   tdMinsTotal += soundData.tdMins[index].value;
    //   tdAvgsTotal += soundData.tdAvgs[index];
    //   tdTotalRanges += soundData.tdRanges[index];

    //   frTotalMaxs += soundData.frMaxs[index].value;
    //   frTotalMins += soundData.frMins[index].value;
    //   frTotalAvgs += soundData.frAvgs[index];
    //   frTotalRanges += soundData.frRanges[index];

    // };

    // soundData.tdAvgTotalMaxs = tdMaxsTotal / arraySize;
    // soundData.tdAvgTotalMins = tdMinsTotal / arraySize;
    // soundData.tdAvgTotalAvgs = tdAvgsTotal / arraySize;
    // soundData.tdAvgTotalRanges = tdTotalRanges / arraySize;

    // soundData.frAvgTotalMaxs = frTotalMaxs / arraySize;
    // soundData.frAvgTotalMins = frTotalMins / arraySize;
    // soundData.frAvgTotalAvgs = frTotalAvgs / arraySize;
    // soundData.frAvgTotalRanges = frTotalRanges / arraySize;
  }

  // Function to map a value from one range to another
  function map(x, oMin, oMax, nMin, nMax) {
    // check range

    if (oMin === oMax) {
      console.log("Warning: Zero input range");
      return null;
    }

    if (nMin === nMax) {
      console.log("Warning: Zero output range");
      return null;
    }

    // check reversed input range
    let reverseInput = false;
    let oldMin = Math.min(oMin, oMax);
    let oldMax = Math.max(oMin, oMax);

    if (oldMin != oMin) reverseInput = true;

    // check reversed output range
    let reverseOutput = false;
    let newMin = Math.min(nMin, nMax);
    let newMax = Math.max(nMin, nMax);

    if (newMin != nMin) reverseOutput = true;

    // calculate new range
    let portion = (x - oldMin) * (newMax - newMin) / (oldMax - oldMin);

    if (reverseInput) portion = (oldMax - x) * (newMax - newMin) / (oldMax - oldMin);

    let result = portion + newMin;

    if (reverseOutput) result = newMax - portion;

    return result;
  }

  //////////////////////////////////////////////////////////////////////
  // Palette Functions
  //////////////////////////////////////////////////////////////////////

  // Builds a palette array[1529] of palette objects
  function buildPalette() {
    let r = 255,
      g = 0,
      b = 0;

    for (g = 0; g <= 255; g++) {
      addToPalette(r, g, b, );
    }
    g--;

    for (r = 254; r >= 0; r--) {
      addToPalette(r, g, b, );
    }
    r++;

    for (b = 1; b <= 255; b++) {
      addToPalette(r, g, b, );
    }
    b--;

    for (g = 254; g >= 0; g--) {
      addToPalette(r, g, b, );
    }
    g++;

    for (r = 1; r <= 255; r++) {
      addToPalette(r, g, b, );
    }
    r--;

    for (b = 254; b > 0; b--) {
      addToPalette(r, g, b, );
    }
    b++;

    function addToPalette(r, g, b) {

      var color = new BABYLON.Color3(r / 255, g / 255, b / 255);

      let mat = new BABYLON.StandardMaterial("mat", scene);
      mat.diffuseColor = color;
      mat.specularColor = new BABYLON.Color3(0, 0, 0);

      palette.push({
        r,
        g,
        b,
        color,
        mat
      });
    }

    console.log(palette);
  }


};