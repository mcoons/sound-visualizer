var soundData;
var scene;

window.onload = function () {

  // Check support
  if (!BABYLON.Engine.isSupported()) {
    window.alert('Browser not supported');
  } else {
    // Babylon is supported
    var canvas = document.getElementById("canvas");
    
    var arraySize = 60;
    
    var showSpheres = true;
    var showSoundWave = true;
    var show3DPlane = true;
    var showFreqGraph = true;
    var useMic = false;  // TODO
    var useToneGenerator = false; // TODO
    
    var palette = [];
    var frObjects = [];
    var tdPoints = [];
    var tdPointColors = [];

    var tdSoundWave = [];
    var spheres = [];
    var frBufferLength, tdBufferLength, frAnalyserNode, tdAnalyserNode;
    var ground;
    
    soundData = initializeSoundData();
    initializeSoundDevices();
    
    // var player;
    // player = document.getElementById('music_player');

    //////////////////////////////////////////////////////////////
    //   Create BABYLONJS Scene
    //////////////////////////////////////////////////////////////

    var engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    
    var pauseUpdates = false;  // Used for pausing playback/scene drawing

    // Main animation loop
    engine.runRenderLoop(function () {
      if (!pauseUpdates) updateScene();
      scene.render();
    });

    // Resize Event Handler
    window.addEventListener("resize", function () {
      engine.resize();
    });
  }

  //////////////////////////////////////////////////////////////
  //   Scene Updating
  //////////////////////////////////////////////////////////////

  function updateScene() {
    analyzeData();

    if (showFreqGraph) updateFreqGraph();
    if (showSoundWave) updateSoundWave();
    if (show3DPlane)   update3DPlane();
    if (showSpheres)   updateSpheres();
  }

  function updateSoundWave(){
      // update sound wave data points
      tdPoints.forEach((point, index) => {
        point.y = -20 + soundData.tdBuffer[index] * 15;
        tdPointColors[index] = palette[Math.round(map(Math.abs(soundData.tdBuffer[index]), 0, 1, 0, 1529))].color;
      });
      // update the sound wave object with the data points
      tdSoundWave = BABYLON.MeshBuilder.CreateLines("tdSoundWave", {
        points: tdPoints,
        colors: tdPointColors,
        instance: tdSoundWave
      });
  }

  function updateFreqGraph(){
    // update frequency graph objects
    frObjects.forEach((object, index) => {
      object.scaling.y = (soundData.frBuffer[index] + 140) * .2;
      object.material = palette[Math.round(map(soundData.frBuffer[index] < -180 ? -180 : soundData.frBuffer[index], -180, -10, 0, 1529))].mat;
    });
  }

  function update3DPlane() {
    // update 3D plane
    let h = frBufferLength;
    let w = soundData.frBufferHistory.length;
    let groundVertices = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    let vertexDataIndex = 0;
    let colorsBuffer = [];

    for (x = 0; x < w; x++) {
      for (y = 0; y < h; y++) {
        let currentData = soundData.frBufferHistory[x];

        let c = palette[Math.round(map(currentData[y] < -180 ? -180 : currentData[y], -180, -12, 0, 1529))].mat.diffuseColor;
        
        // set color for 3D babylonjs canvas 
        colorsBuffer.push(c.r);
        colorsBuffer.push(c.g);
        colorsBuffer.push(c.b);
        colorsBuffer.push(.5);

        // set y value of ground vertex data
        groundVertices[vertexDataIndex + 1] = (180 - Math.abs(currentData[y])) / 10 - 4.5;

        vertexDataIndex = vertexDataIndex + 3;
      }
    }

    // update the 3D babylon ground plane
    ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, groundVertices);
    ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorsBuffer);
  }

  function updateSpheres() {

  }

  //////////////////////////////////////////////////////////////
  //   Scene Creation
  //////////////////////////////////////////////////////////////

  function createScene() {
    var scene = new BABYLON.Scene(engine);
    buildPalette();

    tdPointColors = Array(512).fill(palette[100].color);

    // Parameters: camera, alpha(x), beta(y), radius, target position, scene
    let camera1 = new BABYLON.ArcRotateCamera("camera1", 3 * Math.PI / 2, Math.PI / 3, 95, new BABYLON.Vector3(0, 0, 0), scene);

    // Attach controls to cameras
    camera1.attachControl(canvas, true);

    // Add cameras to scene
    scene.activeCameras.push(camera1);
    scene.clearColor = BABYLON.Color3.Black();

    // Add lights to scene
    let light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(-50, 80, -500), scene);
    // light2.intensity = .5;

    let light1 = new BABYLON.PointLight("light1", new BABYLON.Vector3(500, 500, 500), scene);
    // light1.intensity = .2;
    
    // Add background layer to scene
    // var layer = new BABYLON.Layer('','https://i.imgur.com/mBBxGJH.jpg', scene, true);

    if (showSoundWave) createSoundWave();
    if (showFreqGraph) createFreqGraph();
    if (show3DPlane)   create3DPlane();
    if (showSpheres)   createSpheres();

    return scene;
  }

  function createSoundWave(){
    // Initialize points for sound wave time data
    for (let i = 0; i < tdBufferLength; i++) {
      let point = new BABYLON.Vector3(-tdBufferLength * 1 / 4 + i * 1 / 4 + 64, -33, -.51);
      tdPoints.push(point);
    }

    // Plot initial sound wave 
    tdSoundWave = BABYLON.MeshBuilder.CreateLines("tdSoundWave", { points: tdPoints, colors: tdPointColors, updatable: true}, scene );
  }

  function createFreqGraph(){
    // Create the bars for the frequency graph
    for (let i = 0; i < frBufferLength; i++) {
      let width = .5;
      let depth = .25;
      let thing = BABYLON.MeshBuilder.CreateBox("box" + i, { width: width, depth: depth }, scene);
      thing.material = palette[i].mat;
      thing.position = new BABYLON.Vector3(-frBufferLength * 1 / 4 + i * width, 0, 0);
      frObjects.push(thing);
    }
  }

  function create3DPlane(){
    ground = BABYLON.Mesh.CreateGround('ground1', 1, 1, frBufferLength - 1, scene, true);
    ground.material = new BABYLON.StandardMaterial("gmat", scene);
    ground.material.backFaceCulling = false;
    ground.material.specularColor = new BABYLON.Color3(0, 0, 0); // black is no shine

    ground.position.x -= .2;
    ground.position.z = 64;
    ground.scaling = new BABYLON.Vector3(128, 1, 128);
  }

  function createSpheres(){
    for (let i = 0; i <= 15; i++) {
      let thing1 = BABYLON.MeshBuilder.CreateSphere("sphere" + i, { diameter: 5, tessellation: 8 }, scene);
      thing1.position = new BABYLON.Vector3(i * 8 - 60, -40, 0);
      thing1.material = palette[i * 45].mat;
      spheres.push(thing1);
    }

    // for (let i = 0; i <= 15; i++) {
    //   let thing2 = BABYLON.MeshBuilder.CreateSphere("sphere" + i, { diameter: 5, tessellation: 8 }, scene);
    //   thing2.position = new BABYLON.Vector3(i * 8 - 60, -50, 0);
    //   thing2.material = palette[45 * 16 + i * 45].mat;
    //   spheres.push(thing2);
    // }
  }

  //////////////////////////////////////////////////////////////
  //   Sound Devices
  //////////////////////////////////////////////////////////////


  // Sets up sound devices
  function initializeSoundDevices() {
    var audioCtx = new AudioContext();

    //Create audio source
    //Here, we use an audio file, but this could also be e.g. microphone input
    var audioEle = document.getElementById('music_player');
    
    audioEle.src = './assets/sounds/Barracuda.mp3'; 
    // audioEle.src = './assets/sounds/Mr Roboto.mp3'; 
    // audioEle.src = './assets/sounds/my-audio8.mp3'; 
    // audioEle.src = './assets/sounds/my-audio9.mp3'; 
    // audioEle.src = './assets/sounds/my-audio6.mp3'; 

    // audioEle.src = './assets/sounds/We are Young.mp3'; 
    // audioEle.src = './assets/sounds/Life in the Fast Lane.mp3'; 
    // audioEle.src = './assets/sounds/Tones-01.m4a';
    // audioEle.src = './assets/sounds/my-rec.mp3';
    // audioEle.src = './assets/sounds/La Bamba.mp3'; 
    // audioEle.src = './assets/sounds/The Unforgiven.mp3'; 
    // audioEle.src = './assets/sounds/Dust in the wind.mp3'; 
    // audioEle.src = './assets/sounds/Money.mp3'; 
    // audioEle.src = './assets/sounds/The Souths Gonna Do It.mp3'; 
    // audioEle.src = './assets/sounds/Riders on the Storm.mp3'; 

    audioEle.preload = 'auto';
    audioEle.autoplay = true;
    audioEle.loop = true;
    var audioSourceNode = audioCtx.createMediaElementSource(audioEle);

    // Create frequency analyser node 
    frAnalyserNode = audioCtx.createAnalyser();
    frAnalyserNode.fftSize = 512; //  power of 2 between 2^5 and 2^15,
    frAnalyserNode.maxDecibels = -45;
    frAnalyserNode.minDecibels = -50;
    frAnalyserNode.smoothingTimeConstant = 0.5;
    frBufferLength = frAnalyserNode.frequencyBinCount;
    soundData.frBuffer = new Float32Array(frBufferLength);

    // Create time data analyser node
    tdAnalyserNode = audioCtx.createAnalyser();
    tdAnalyserNode.fftSize = 1024;
    tdAnalyserNode.maxDecibels = -45;
    tdAnalyserNode.minDecibels = -50;
    tdAnalyserNode.smoothingTimeConstant = 0.35;
    tdBufferLength = tdAnalyserNode.frequencyBinCount;
    soundData.tdBuffer = new Float32Array(tdBufferLength);

    // Set up the audio node network
    audioSourceNode.connect(frAnalyserNode);
    frAnalyserNode.connect(tdAnalyserNode);
    tdAnalyserNode.connect(audioCtx.destination);

    // Pause Control Button
    let pauseButton = document.querySelector('#start');
    pauseButton.onclick = function (event) {
      // event.preventDefault();
      console.info('Button pressed')
      if (audioCtx.state === 'running') {
        audioCtx.suspend().then(function () {
          pauseButton.textContent = 'Resume';
          pauseUpdates = true;
        });
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(function () {
          pauseButton.textContent = 'Pause';
          pauseUpdates = false;
        });
      } else {
        console.error("Unhandled audioCtx.state:", audioCtx.state);
      }
    }

  }

//////////////////////////////////////////////////////////////
//   Sound Data
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
//////////////////////////////////////////////////////////////
  

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

    for (x = 0; x < 256; x++) {
      let currentData = [];
      for (y = 0; y < 256; y++) {
        currentData.push(-180);
      }
      soundData.frBufferHistory.push(currentData);
    }

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

  // Anlyze Frequency and Time Domain samples for this frame
  function analyzeData() {
    let tdMaxsTotal = tdMinsTotal = tdAvgsTotal = tdTotalRanges = 0;
    let frTotalMaxs = frTotalMins = frTotalAvgs = frTotalRanges = 0;

    frAnalyserNode.getFloatFrequencyData(soundData.frBuffer);
    soundData.frBufferHistory.push(soundData.frBuffer.slice(0));
    if (soundData.frBufferHistory.length > frBufferLength) soundData.frBufferHistory.shift();

    tdAnalyserNode.getFloatTimeDomainData(soundData.tdBuffer);
    soundData.tdBufferHistory.push(soundData.tdBuffer.slice(0));
    if (soundData.tdBufferHistory.length > tdBufferLength) soundData.tdBufferHistory.shift();

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

    for (let i = 0; i < tdBufferLength; i++) {
      if (soundData.tdBuffer[i] > soundData.tdMax.value) soundData.tdMax = {
        index: i,
        value: soundData.tdBuffer[i]
      };
      if (soundData.tdBuffer[i] < soundData.tdMin.value) soundData.tdMin = {
        index: i,
        value: soundData.tdBuffer[i]
      };
      soundData.tdTot += soundData.tdBuffer[i];

      if (soundData.tdBuffer[i] > soundData.tdMaxAllTime) soundData.tdMaxAllTime = soundData.tdBuffer[i];
      if (soundData.tdBuffer[i] < soundData.tdMinAllTime) soundData.tdMinAllTime = soundData.tdBuffer[i];

    }

    soundData.tdMaxs.push(soundData.tdMax);
    if (soundData.tdMaxs.length > arraySize) soundData.tdMaxs.shift();

    soundData.tdMins.push(soundData.tdMin);
    if (soundData.tdMins.length > arraySize) soundData.tdMins.shift();

    // Calculate average
    soundData.tdAvg = soundData.tdTot / tdBufferLength;
    soundData.tdAvgs.push(soundData.tdAvg);
    if (soundData.tdAvgs.length > arraySize) soundData.tdAvgs.shift();

    // Calculate range
    soundData.tdRange = soundData.tdMax.value - soundData.tdMin.value;
    soundData.tdRanges.push(soundData.tdRange);
    if (soundData.tdRanges.length > arraySize) soundData.tdRanges.shift();



    // Calculate frequency min and max and get total for averaging
    //  fr   {-180, -12 }
    soundData.frMax = {
      index: 0,
      value: -500
    };
    soundData.frMin = {
      index: 0,
      value: 500
    };
    soundData.frTot = 0;

    for (let i = 0; i < frBufferLength; i++) {
      if (soundData.frBuffer[i] > soundData.frMax.value) soundData.frMax = {
        index: i,
        value: soundData.frBuffer[i]
      };
      if (soundData.frBuffer[i] < soundData.frMin.value) soundData.frMin = {
        index: i,
        value: soundData.frBuffer[i]
      };
      soundData.frTot += soundData.frBuffer[i];

      if (soundData.frBuffer[i] > soundData.frMaxAllTime) soundData.frMaxAllTime = soundData.frBuffer[i];
      if (soundData.frBuffer[i] < soundData.frMinAllTime && soundData.frBuffer[i] > -100000) soundData.frMinAllTime = soundData.frBuffer[i];
    }

    soundData.frMaxs.push(soundData.frMax);
    if (soundData.frMaxs.length > arraySize) soundData.frMaxs.shift();

    soundData.frMins.push(soundData.frMin);
    if (soundData.frMins.length > arraySize) soundData.frMins.shift();

    // Calculate average 
    soundData.frAvg = soundData.frTot / frBufferLength;
    soundData.frAvgs.push(soundData.frAvg);
    if (soundData.frAvgs.length > arraySize) soundData.frAvgs.shift();

    // Calculate range
    soundData.frRange = soundData.frMax.value - soundData.frMin.value;
    soundData.frRanges.push(soundData.frRange);
    if (soundData.frRanges.length > arraySize) soundData.frRanges.shift();


    // 

    for (let index = 0; index < arraySize; index++) {
      tdMaxsTotal += soundData.tdMaxs[index].value;
      tdMinsTotal += soundData.tdMins[index].value;
      tdAvgsTotal += soundData.tdAvgs[index];
      tdTotalRanges += soundData.tdRanges[index];

      frTotalMaxs += soundData.frMaxs[index].value;
      frTotalMins += soundData.frMins[index].value;
      frTotalAvgs += soundData.frAvgs[index];
      frTotalRanges += soundData.frRanges[index];

    };

    soundData.tdAvgTotalMaxs = tdMaxsTotal / arraySize;
    soundData.tdAvgTotalMins = tdMinsTotal / arraySize;
    soundData.tdAvgTotalAvgs = tdAvgsTotal / arraySize;
    soundData.tdAvgTotalRanges = tdTotalRanges / arraySize;

    soundData.frAvgTotalMaxs = frTotalMaxs / arraySize;
    soundData.frAvgTotalMins = frTotalMins / arraySize;
    soundData.frAvgTotalAvgs = frTotalAvgs / arraySize;
    soundData.frAvgTotalRanges = frTotalRanges / arraySize;
  }

  //////////////////////////////////////////////////////////////
  // Utility Functions
  //////////////////////////////////////////////////////////////

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

      var color = new BABYLON.Color4(r / 255, g / 255, b / 255, 1);

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

    // console.log(palette);
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

};