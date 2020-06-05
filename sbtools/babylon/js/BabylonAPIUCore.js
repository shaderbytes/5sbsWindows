var  BabylonAPIUCore = function(applicationRef,canvasDomRef){
   SBJSCore.UIItemEventDispatcher.call(this);
    this.application = applicationRef;
    this.scene;
    this.engine;   
    this.hdrTexture;
    this.canvasDom = canvasDomRef;
    this.assetController;
    this.xmlLoader = new SBJS_AJAXCore.XMLLoader();
    this.xmlLoader.addEventListener(this.EVENT_COMPLETE,this.onPostBuild.bind(this));
    this.enableLights = true;
    this.pointLights = {};
    this.SSAOPipeline;
    this.glowLayer;
    this.camera;
   

};

BabylonAPIUCore.prototype = {

    changeBackgroundColor:function(color){
   
        this.scene.clearColor = BABYLON.Color3.FromHexString(color);
    },
    dimEnvironment:function(state){
        this.scene.environmentIntensity = state?0.49:0.8;  
    },
    setGlowLayer:function(state){
        if(state === true){
            this.glowLayer = new BABYLON.GlowLayer("glow", this.scene);
            this.glowLayer.intensity = 1.5;
    
        }else{
            if(this.glowLayer !== null && this.glowLayer !== undefined){
                this.glowLayer.dispose();
            }
        }
    
    },
    setSSAO:function(state){

         if(state === true){

            if (BABYLON.SSAO2RenderingPipeline.IsSupported) {
       
                // Create SSAO and configure all properties (for the example)
                var ssaoRatio = {
                    ssaoRatio: 0.5, // Ratio of the SSAO post-process, in a lower resolution
                    blurRatio: 0.5// Ratio of the combine post-process (combines the SSAO and the scene)
                };       
                this.SSAOPipeline = new BABYLON.SSAO2RenderingPipeline("ssao", this.scene, ssaoRatio);
                this.SSAOPipeline.radius = 2;
                this.SSAOPipeline.totalStrength = 1;
                this.SSAOPipeline.expensiveBlur = true;
                this.SSAOPipeline.samples = 32;
                this.SSAOPipeline.maxZ = 250;         
                // Attach camera to the SSAO render pipeline
                this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", this.camera);
                this.scene.postProcessRenderPipelineManager.enableEffectInPipeline("ssao",  this.SSAOPipeline.SSAOCombineRenderEffect, this.camera);  

                //fix for ssao affecting transparent objects
                this.scene.enableGeometryBufferRenderer().renderTransparentMeshes = false;
       
            }
           
    
        }else{
            if(this.SSAOPipeline !== null && this.SSAOPipeline !== undefined){
                this.SSAOPipeline.dispose();
            }
        }

    
    },
    resetCamera:function(){
      
        this.camera.target = new BABYLON.Vector3(0, 2.35, 1.9);
        this.camera.alpha = 1.5708;
        this.camera.beta = 1.5708;
        this.camera.radius = 10.78;

        //i dont know why i ave to set these twice but I do
        this.camera.target = new BABYLON.Vector3(0, 2.35, 1.9);
        this.camera.alpha = 1.5708;
        this.camera.beta = 1.5708;
        this.camera.radius = 10.78;
    },
    create:function () {
  
        this.engine = new BABYLON.Engine(this.canvasDom, true); // Generate the BABYLON 3D engine
        this.engine.enableOfflineSupport = false;
        BABYLON.Database.IDBStorageEnabled = false;//disable the .manifest checking.
        this.scene = new BABYLON.Scene(this.engine);// Create the scene space
        this.scene.clearColor = new BABYLON.Color3(0.266, 0.266, 0.266).toLinearSpace();     

        //Adding an Arc Rotate this.camera .. 
        this.camera = new BABYLON.ArcRotateCamera("Camera", 1.5708, 1.5708, 10.78, new BABYLON.Vector3(0, 2.35, 1.9), this.scene);
        this.camera.attachControl(this.canvasDom, false);
        this.camera.wheelPrecision = 50;
        this.camera.panningSensibility = 250;
        this.camera.pinchPrecision = 700;
        //console.log("panningSensibility "+this.camera.panningSensibility);
        //console.log("pinchDeltaPercentage "+this.camera.pinchDeltaPercentage);
       // console.log("pinchPrecision "+this.camera.pinchPrecision);
       
        this.camera.panningSensibility = 1000;  
        this.camera.allowUpsideDown  = false;
        this.camera.lowerRadiusLimit = 0.01;
        //this.camera.minZ = 0.030;    


       this.hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("sbtools/babylon/assets/images/autoshop_02_2k_bw.env", this.scene);
       this.hdrTexture.gammaSpace = false;
       this.hdrTexture.level = 1;
       this.scene.environmentTexture = this.hdrTexture;
       // var box = this.scene.createDefaultSkybox(this.hdrTexture, false, (this.scene.activeCamera.maxZ - this.scene.activeCamera.minZ) / 2, 0.7);
       this.scene.environmentIntensity = 0.49;         

        this.setSSAO(true);
      
        var pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline",false);
        pipeline.imageProcessingEnabled = true;
        // pipeline.fxaaEnabled = true;
        pipeline.samples = 4;
        pipeline.fxaaEnabled = true;
        pipeline.imageProcessing.colorCurvesEnabled = false;
        pipeline.imageProcessing.vignetteEnabled = false;
        pipeline.imageProcessing.colorGradingEnabled= false;
        pipeline.imageProcessing.contrast = 1;
        pipeline.imageProcessing.exposure = 1.2;
        pipeline.imageProcessing.toneMappingEnabled = true;       
        pipeline.imageProcessing.toneMappingType =  BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        //pipeline.imageProcessing.toneMappingType = 1;
       
       

        this.assetController = new BabylonAssetController(this);

        var lightColor =  BABYLON.Color3.FromHexString("#FDFFB5");
        var light = this.pointLights["light_1"] = new BABYLON.PointLight("light_1",new BABYLON.Vector3(3,4,2),this.scene);
        light.shadowEnabled = false;
        light.intensity = 8;
        light.diffuse = lightColor;     

        light = this.pointLights["light_2"] = new BABYLON.PointLight("light_2",new BABYLON.Vector3(0,4,2),this.scene);
        light.shadowEnabled = false;
        light.intensity = 8;
        light.diffuse = lightColor;
     
        light = this.pointLights["light_3"] = new BABYLON.PointLight("light_3",new BABYLON.Vector3(-3,4,2),this.scene);
        light.shadowEnabled = false;
        light.intensity = 8;
        light.diffuse = lightColor;    



        this.setGlowLayer(true);
        

        this.assetController.setEmmissive("led_light_1","emissiveIntensity",4);
        this.assetController.setEmmissive("glass_4","emissiveIntensity",1);


       
        this.xmlLoader.addItemToLoad("sbtools/babylon/data/assets.xml","data",this.assetController);
        this.xmlLoader.startLoading();
       
       
       
      
     

    },

    onPostBuild:function(){
       // Register a render loop to repeatedly render the scene
       this.engine.runRenderLoop(this.onRenderLoop.bind(this) );   
       // Watch for browser/canvas resize events
       window.addEventListener("resize", this.onWindowResize.bind(this)); 
       this.dispatchEvent(this.EVENT_COMPLETE,this);
    
    } ,  

    onRenderLoop:function (){    
        this.scene.render();
    },
    onWindowResize:function(){
        this.engine.resize();
    }
};

var inherit_1 = Object.create(SBJSCore.UIItemEventDispatcher.prototype);
Object.assign(inherit_1, BabylonAPIUCore.prototype);
BabylonAPIUCore.prototype = inherit_1;