function Application() {
     
    var ui;   
    var colorUtility = new SBColorUtility();
    var sentrelImageSourceRegular;
    var sentrelImageSourceSim;
    var sentrelImageSourceAccent;
    var isDebugShowing = false;
    var isTheme1 = true;
    var col1 = "#2a2a2a";
    var col2 = "#E0E0E0";
    var col3 = "#4b4b4b";
    var col4 = "#ffffff";
    var canvas = $("#renderCanvas");
    var loadProgressComponent = $("#preloader-1");
    var loadProgressComponentP = loadProgressComponent.find("p")[0];
    var mainUI = $(".ui-item-container");
    var uiHeadContent = $(".ui-header-content");
    var mainUI = $(".ui-item-container");
    var uiToolContent;
    var topNav;
    var settingsNav;
    var preloaderTimeOut;
    var isOrientationLandscape = true;
    var windowJQ = $(window);
    var isMenuShowing = true;
    var frameskip = false;

    this.onCameraReset = function(event){
        bl.resetCamera();
    };

    //----------------------------------------------------------------------------------------------------------------

     this.onWindowResize = function(){
       
       if(windowJQ.height() > windowJQ.width()){
            isOrientationLandscape = false; 
            canvas[0].style.cssText = "";
            mainUI[0].style.cssText = "";
            uiHeadContent[0].style.cssText = "";
            topNav[0].style.cssText = "";
            uiToolContent[0].style.cssText = "";
            settingsNav[0].style.cssText = "";

       }else{
            isOrientationLandscape = true;  
       }
       TweenMax.killAll(true,true,true,true);
       
       ui.setOrientation(isOrientationLandscape);
       this.setMainUIDisplay(isOrientationLandscape);

        bl.engine.resize();
    };

    //----------------------------------------------------------------------------------------------------------------

    this.setMainUIDisplay = function(displayState){
        isMenuShowing = displayState;
        mainUI.css("display",displayState?"block":"none");
    };

    

    //----------------------------------------------------------------------------------------------------------------

    this.setSceneMinimalRendering= function(event){
           var val = !event.UIItemTarget.isSelected;
           bl.scene.shadowsEnabled = val;
           bl.scene.lightsEnabled = val;
           bl.scene.imageProcessingConfiguration.isEnabled = val;          
           bl.dimEnvironment(val);
           bl.setGlowLayer(val);
           bl.setSSAO(val);
    };

     //----------------------------------------------------------------------------------------------------------------

    this.onSettingsClick = function(event){    
     if(event.UIItemTarget.isSelected){
        ui.setAssetVisibilityFilter(event);
     }else{
        ui.removeAssetVisibilityFilter(event,true);
     }
     
    
    };

     //----------------------------------------------------------------------------------------------------------------

    this.onTreeLinesClick = function(event){ 
       
        var UIIC =event.UIItemTarget.UIItemController;
        UIIC.treeLinesActive = !UIIC.treeLinesActive;
        UIIC.setTreeLineVisibility();
      
                
    };

    this.onUIPositionUpdate = function(){
       // if(!frameskip){
            bl.engine.resize();
       // }
      //  frameskip = !frameskip;
    }

     //----------------------------------------------------------------------------------------------------------------


    this.onNavigationExpansionClick = function(event){   

        if(!isOrientationLandscape){
            //portrait mode show just toggle diplay
            isMenuShowing = !isMenuShowing;
             this.setMainUIDisplay(isMenuShowing);
    
        }else{
            //landscape mode so use side animation
             isMenuShowing = !isMenuShowing;
            if(!isMenuShowing){
                var w = windowJQ.width() - 205;
                var h = windowJQ.height() - 55;
                TweenMax.to(canvas[0],.2,{css:{width:"100%",top:55,height:h},onUpdate :this.onUIPositionUpdate});
                TweenMax.to(mainUI[0],.2,{css:{left:-360}});
                TweenMax.to(uiHeadContent[0],.2,{css:{height:50,width:200,padding:4}});
                TweenMax.to(topNav[0],.2,{css:{height:50}});
                TweenMax.to(uiToolContent[0],.2,{css:{width:w,left:205}});
                TweenMax.to(settingsNav[0],.2,{css:{top:50}});
                
            }else{
                var w = windowJQ.width() - 365;
                var h = windowJQ.height() - 105;
                TweenMax.to(canvas[0],.2,{css:{width:w,top:105,height:h},onUpdate :this.onUIPositionUpdate});
                TweenMax.to(mainUI[0],.2,{css:{left:0}});
                TweenMax.to(uiHeadContent[0],.2,{css:{height:100,width:360,padding:15}});
                TweenMax.to(topNav[0],.2,{css:{height:100}});                
                TweenMax.to(uiToolContent[0],.2,{css:{width:w,left:365}});
                 TweenMax.to(settingsNav[0],.2,{css:{top:100}});
            }
        }

      
      
                
    };

    //----------------------------------------------------------------------------------------------------------------


    this.onThemesClick = function(event){ 
        
        //dont care about the event data for this kind of action
        var index = ui.getNextThemeIndex();
        ui.setTheme(index);
        //system supports  any number of themes , a I currently know there are only two created in the data
        //im doing a hack here to just alter the 3d scene in a binary option manner
        isTheme1 = !isTheme1;       
        bl.changeBackgroundColor((isTheme1)?col1:col2);
        bl.assetController.setColor("wall_exterior_shell","albedoColor",(isTheme1)?col3:col4);          
                
    };

    //----------------------------------------------------------------------------------------------------------------


    this.updateLoadProgress = function(value){
   
       loadProgressComponentP.innerHTML = value;
    
    };

    //----------------------------------------------------------------------------------------------------------------

    this.setLoadProgressDisplay = function(displayStateToSet){
        if(!displayStateToSet){
            clearTimeout(preloaderTimeOut);            
            preloaderTimeOut = setTimeout(function(){ loadProgressComponent.css("display","none"); }, 400);           
        }else{
            clearTimeout(preloaderTimeOut);  
            loadProgressComponent.css("display","block");
        }

        
    };

    //----------------------------------------------------------------------------------------------------------------


    this.onPostBuild = function(){
        ui = new SBJS_UIBuild(this);       
        ui.xmlLoader.addItemToLoad("sbtools/ui/data//SBXML_UIBuild.xml","dataUI",ui);
        ui.xmlLoader.addItemToLoad("sbtools/ui/data//SBXML_UIThemes.xml","dataUIThemes",ui);    
        ui.xmlLoader.startLoading();
    };

    this.setAssetRotation = function(event){

        if(Array.isArray(event.data)){
            for(var i=0;i<event.data.length;i++){
              bl.assetController.setAssetRotation(event.UIItemTarget.isSelected,event.data[i]);
            }
    
        }else{
             bl.assetController.setAssetRotation(event.UIItemTarget.isSelected,event.data);   
        }


    
        
    }

   
   //----------------------------------------------------------------------------------------------------------------
   

    this.setAssetTransformFilter = function(event){

        if(event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                    bl.assetController.setAssetTransformFilter(event.data[i].filter);
                }
    
            }else{
                bl.assetController.setAssetTransformFilter(event.data.filter);
            }
             bl.assetController.invalidateAssetTransformFilters();
        }else{
            this.removeAssetTransformFilter(event);
        }

    };

    //----------------------------------------------------------------------------------------------------------------

     this.removeAssetTransformFilter = function(event){

       
        if(Array.isArray(event.data)){
            for(var i=0;i<event.data.length;i++){
                bl.assetController.removeAssetTransformFilter(event.data[i].filter);
            }
    
        }else{
            bl.assetController.removeAssetTransformFilter(event.data.filter);
        }
            bl.assetController.invalidateAssetTransformFilters();
        

    };

    //----------------------------------------------------------------------------------------------------------------

    this.setAssetVisibilityFilter = function(event){
        ui.setAssetVisibilityFilter(event);
       // console.log("setAssetVisibilityFilter in application vent.UIItemTarget.isSelected "+event.UIItemTarget.isSelected) ;
        //console.log(event);
        if(event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                    var val;
                    if(event.data[i].filterValue !== null && event.data[i].filterValue !== undefined ){
                        val = event.data[i].filterValue;
                    }
                    bl.assetController.setAssetVisibilityFilter(event.data[i].filter,val);
                }
    
            }else{
                var val;
                if(event.data.filterValue !== null && event.data.filterValue !== undefined ){
                    val = event.data.filterValue;
                }
                bl.assetController.setAssetVisibilityFilter(event.data.filter,val);
            }
             bl.assetController.invalidateAssetVariants();
             bl.assetController.invalidateAssetsForVisibilityFilters();
        }
       

       
    };

    //----------------------------------------------------------------------------------------------------------------


     this.removeAssetVisibilityFilter = function(event){  
        ui.removeAssetVisibilityFilter(event);
       // console.log("removeAssetVisibilityFilter in application vent.UIItemTarget.isSelected "+event.UIItemTarget.isSelected) ;
       // console.log(event);
        if(event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                   bl.assetController.removeAssetVisibilityFilter(event.data[i].filter);
                }
    
            }else{
               bl.assetController.removeAssetVisibilityFilter(event.data.filter);
            }
             bl.assetController.invalidateAssetVariants();
             bl.assetController.invalidateAssetsForVisibilityFilters();
        }
       

    };
    
    //----------------------------------------------------------------------------------------------------------------

    this.setSentrelTextureRegular = function(event){

         if(event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                    bl.assetController.setTexture(event.data[i].assetTargetKey,event.data[i].channel, sentrelImageSourceRegular);
                }
    
            }else{
                 bl.assetController.setTexture(event.data.assetTargetKey,event.data.channel, sentrelImageSourceRegular);
            }
         }
    };

    //----------------------------------------------------------------------------------------------------------------

    this.setSentrelTextureSim = function(event){

         if(event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                    bl.assetController.setTexture(event.data[i].assetTargetKey,event.data[i].channel, sentrelImageSourceSim);
                }
    
            }else{
                 bl.assetController.setTexture(event.data.assetTargetKey,event.data.channel, sentrelImageSourceSim);
            }
         }
    };

    //----------------------------------------------------------------------------------------------------------------

    this.setSentrelTextureAccent = function(event){

         if(event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                    bl.assetController.setTexture(event.data[i].assetTargetKey,event.data[i].channel, sentrelImageSourceAccent);
                }
    
            }else{
                 bl.assetController.setTexture(event.data.assetTargetKey,event.data.channel, sentrelImageSourceAccent);
            }
         }
    };

    //----------------------------------------------------------------------------------------------------------------

    this.setSentrelImageSource = function(event){
        
        //do not care about deselections for this listener
        if(event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                    if(event.data[i].url_regular){
                         sentrelImageSourceRegular =  ui.dataUI.ROOT.URLS[event.data[i].url_regular].nodeValue;
                    }
                    if(event.data[i].url_sim){
                         sentrelImageSourceSim =  ui.dataUI.ROOT.URLS[event.data[i].url_sim].nodeValue;
                    }
                     if(event.data[i].url_accent){
                         sentrelImageSourceAccent =  ui.dataUI.ROOT.URLS[event.data[i].url_accent].nodeValue;
                    }
                    
                }
    
            }else{
                if(event.data.url_regular){
                         sentrelImageSourceRegular =  ui.dataUI.ROOT.URLS[event.data.url_regular].nodeValue;
                }
                if(event.data.url_sim){
                        sentrelImageSourceSim =  ui.dataUI.ROOT.URLS[event.data.url_sim].nodeValue;
                }
                if(event.data.url_accent){
                        sentrelImageSourceAccent =  ui.dataUI.ROOT.URLS[event.data.url_accent].nodeValue;
                }
            }
        }


    };

    //----------------------------------------------------------------------------------------------------------------
    
    this.setAssetVisibility = function(event){    
     
       
       if(Array.isArray(event.data)){
        for(var i=0;i<event.data.length;i++){
            var bool = event.UIItemTarget.isSelected;
            if(event.data[i].requestedState !== null && event.data[i].requestedState !== undefined){
               
                bool = event.data[i].requestedState;
            }
             bl.assetController.setEnabled(event.data[i].assetTargetKey,bool);  
        }
    
        }else{
            var bool = event.UIItemTarget.isSelected;
             if(event.data.requestedState !== null && event.data.requestedState !== undefined){
                
                bool = event.data.requestedState;
            }
            bl.assetController.setEnabled(event.data.assetTargetKey,bool);  
        }

    };

    //----------------------------------------------------------------------------------------------------------------

    this.setAssetGroupVisibility = function(event){ 
    
         //console.log("setAssetGroupVisibility");
         if(Array.isArray(event.data)){
        for(var i=0;i<event.data.length;i++){
            var bool = event.UIItemTarget.isSelected;
            if(event.data[i].requestedState !== null && event.data[i].requestedState !== undefined){
               
                bool = event.data[i].requestedState;
            }
             bl.assetController.setGroupEnabled(event.data[i].assetTargetKey,bool);  
        }
    
        }else{
            var bool = event.UIItemTarget.isSelected;
             if(event.data.requestedState !== null && event.data.requestedState !== undefined){
                
                bool = event.data.requestedState;
            }
            bl.assetController.setGroupEnabled(event.data.assetTargetKey,bool);  
        }       

    };


    //----------------------------------------------------------------------------------------------------------------

    this.setAssetVisibilityWithVariant = function(event){ 
    
          bl.assetController.setVariantEnabled(event);

    };

    //----------------------------------------------------------------------------------------------------------------

    this.setAssetTexture = function(event){ 
   
    
        if(Array.isArray(event.data)){
        for(var i=0;i<event.data.length;i++){
         console.log("url "+url);
            var url =  ui.dataUI.ROOT.URLS[event.data[i].url].nodeValue;
             if(url === "" || url === undefined){
                url = null;
            }
            bl.assetController.setTexture(event.data[i].assetTargetKey,event.data[i].channel,url);   
        }
    
        }else{
            var url =  ui.dataUI.ROOT.URLS[event.data.url].nodeValue;
            console.log("url "+url);
            if(url === "" || url === undefined){
                url = null;
            }
            bl.assetController.setTexture(event.data.assetTargetKey,event.data.channel, url);   
        }
       
    
    };

    //----------------------------------------------------------------------------------------------------------------

    this.setAssetColor = function(event){ 
    
        if(Array.isArray(event.data)){
            for(var i=0;i<event.data.length;i++){

               bl.assetController.setColor(event.data[i].assetTargetKey,event.data[i].channel, event.data[i].color);      
            }
    
        }else{
          bl.assetController.setColor(event.data.assetTargetKey,event.data.channel, event.data.color);      
        }

       
    }; 
    
    

    //----------------------------------------------------------------------------------------------------------------

     function handleInput(event) {
     // console.log(event.which);
        switch (event.which) {
       
            case 73:
            isDebugShowing = !isDebugShowing;
            if(isDebugShowing){
            $("#content").css("z-index",9000);
                bl.scene.debugLayer.show();
            }else{
              $("#content").css("z-index","");
                bl.scene.debugLayer.hide();
            }          
          

        }

    };

    this.onUIReady = function(){
         topNav = $(".top-nav");
         uiToolContent = $(".ui-item-tools-content");
         settingsNav =$(".settings-nav");
         window.onresize = this.onWindowResize.bind(this);
         this.onWindowResize();
         bl.changeBackgroundColor(col1);
         bl.assetController.setColor("wall_exterior_shell","albedoColor",col3); 
    };

    //----------------------------------------------------------------------------------------------------------------

    var bl = new BabylonAPIUCore(this,canvas[0]);
    bl.addEventListener(bl.EVENT_COMPLETE,this.onPostBuild.bind(this));
    bl.create();


    $(document).keydown(handleInput);
   

  
   
};