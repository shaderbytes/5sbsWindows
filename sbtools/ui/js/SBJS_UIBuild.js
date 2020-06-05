


//need to add button hilights


var SBJS_UIBuild  = function(applicationTargetRef){
    SBJSCore.UIItemEventDispatcher.call(this);
    this.dataUI = {};
    this.dataUIThemes = {};
    this.dataUIThemesIndex = 0;   
    this.UIIControllerComponents = {};     
    this.applicationTarget = applicationTargetRef;     
    this.buildComplete = false;
    this.xmlLoader = new SBJS_AJAXCore.XMLLoader();
    this.xmlLoader.addEventListener(this.EVENT_COMPLETE,this.onPostBuild.bind(this));

}

var EventDispatcherInherit = Object.create(new SBJSCore.UIItemEventDispatcher());


var SBJS_UIBuildPrototype = {   

    //BUILD FUNCTIONS---------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    buildThemeSets :function(data){   
        this.dataUIThemesIndex = parseFloat(data.ROOT.THEME_INDEX_DEFAULT.nodeValue);
        this.setTheme( this.dataUIThemesIndex);  
        
    
    },

    buildUIComponents :function(data){   
        
            //UIItemController
            data.ROOT.UI_ITEM_CONTROLLER = SBJSCore.forceDataToArray(data.ROOT.UI_ITEM_CONTROLLER);             
           
            for(var i=0;i<data.ROOT.UI_ITEM_CONTROLLER.length;i++){
                var UICData  = data.ROOT.UI_ITEM_CONTROLLER[i];                
                var UICComponent =  new SBJS_UICore.UIItemController();                 
                UICComponent.build($(UICData.DOM_TARGET.nodeValue)[0]);
                // store UIItemControllers via their DOM_TARGET selector so other code can look them up via a simple string
                this.UIIControllerComponents[UICData.DOM_TARGET.nodeValue] = UICComponent;                
                this.buildUIItemGeneric(UICComponent,UICComponent,UICData,UICComponent);    
            }   
    },   
    //UITargetAlternate was a quick fix for now because all builds work the same - except for accordian
    //need to review that structure and see if it can be neutralized
    buildUIItemGeneric:function(UICComponent,UIItemTarget,data,UITargetAlternate){
        //EVENT_LISTENER
        this.processCSSProperties(UIItemTarget,data);      
        this.processDataProperties(UIItemTarget,data); 
        this.processVisibilityFilters(UIItemTarget,data);
        

        this.processSelectionGroups(UICComponent,UIItemTarget,data);
        if(data.CHILDREN){
            this.processChildren(UICComponent,UITargetAlternate,data.CHILDREN);
        }
    },
    buildUIDiv:function(UICComponent,data){
        //changed this from UICore to UIItem as it needed filtering functionality
        var UIItemTarget = new SBJS_UICore.UIItem();
        UIItemTarget.initialize(UICComponent);
        this.buildUIItemSpecials(UICComponent,UIItemTarget,data,UIItemTarget); 
        this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget); 
       
        return UIItemTarget;          

    
    },
    buildUIItemAccordian :function(UICComponent,data){      

        var header;
        if(data.HEADER){
            header = this["build"+data.HEADER.UII.TYPE.nodeValue](UICComponent,data.HEADER.UII);
        }
        var UIItemTarget;
        if(header !==null && header !== undefined){
       
            UIItemTarget = new SBJS_UICore.UIItemAccordian();
            UIItemTarget.initialize(UICComponent);
            UIItemTarget.build(header);
        }else{
            console.error("buildUIItemAccordian called and failed to build the header , check data values");
            return;
        }       

         this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget.domElementChildrenContent);
        return UIItemTarget;
    
    },
    buildUIItem :function(UICComponent,data){
        
        var UIItemTarget  = new SBJS_UICore.UIItem();
        UIItemTarget.initialize(UICComponent);
        this.buildUIItemSpecials(UICComponent,UIItemTarget,data,UIItemTarget); 
        this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget); 
        return UIItemTarget;
    
    },
       
    buildUIItemButton :function(UICComponent,data){
        
        var UIItemTarget  = new SBJS_UICore.UIItemButton();      
        UIItemTarget.initialize(UICComponent);
        UIItemTarget.build();         
        this.processInteractionHooks(UIItemTarget,data);
        this.buildUIItemSpecials(UICComponent,UIItemTarget,data,UIItemTarget); 
        this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget); 
        return UIItemTarget;
    
    },
    buildUIItemLabel :function(UICComponent,data){   
       
        var UIItemTarget  = new SBJS_UICore.UIItemLabel();
        UIItemTarget.initialize(UICComponent);
        UIItemTarget.build(data.VALUE.nodeValue);
        this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget);    
        return UIItemTarget;

    },
    buildUIItemIcon :function(UICComponent,data){
       
       
        //sort out urls as they are just key pointers to the URLS object in the data
        data.URL = SBJSCore.forceDataToArray(data.URL);
        for(var i=0;i<data.URL.length;i++){
            data.URL[i] = this.dataUI.ROOT.URLS[data.URL[i].nodeValue].nodeValue;
        }

        var UIItemTarget  = new SBJS_UICore.UIItemIcon();
        UIItemTarget.initialize(UICComponent);
        this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget);         
        UIItemTarget.build(data.URL);             
        return UIItemTarget;

    },
    buildUIItemIconImage :function(UICComponent,data){

      //sort out urls as they are just key pointers to the URLS object in the data
        data.URL = SBJSCore.forceDataToArray(data.URL);
        for(var i=0;i<data.URL.length;i++){
            data.URL[i] = this.dataUI.ROOT.URLS[data.URL[i].nodeValue].nodeValue;
        }

        var UIItemTarget  = new SBJS_UICore.UIItemIconImage();
        UIItemTarget.initialize(UICComponent);
        this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget);         
        UIItemTarget.build(data.URL);              
        return UIItemTarget;      

    },
    buildUIItemSlider :function(UICComponent,data){       
       
        var  UIItemTarget = new SBJS_UICore.UIItemSlider();
        UIItemTarget.initialize(UICComponent);
        UIItemTarget.build();        
        UIItemTarget.scrubberTrackContainer.setCSS(data.CSS_TRACK_CONTAINER.nodeValue);    
        UIItemTarget.scrubberTrack.setCSS(data.CSS_TRACK_GRAPHIC.nodeValue);    
        UIItemTarget.scrubberButton.setCSS(data.CSS_BUTTON.nodeValue);   
        UIItemTarget.label.setCSS(data.CSS_LABEL.nodeValue);   
        UIItemTarget.label.updateText(data.LABEL.nodeValue); 
         
        var icon;
        if(data.ICON){
            icon = this["build"+data.ICON.UII.TYPE.nodeValue](UICComponent,data.ICON.UII);       
        }

        if(icon !== null && icon !== undefined){
             UIItemTarget.scrubberButton.addChild(icon);
           
        }

         this.processInteractionHooks(UIItemTarget,data);           
        this.buildUIItemGeneric(UICComponent,UIItemTarget,data,UIItemTarget); 
        return UIItemTarget;
    
    },
    onPostBuild :function(){
   
        for(var prop in this.UIIControllerComponents){
            this.UIIControllerComponents[prop].invalidatePostBuild();              
        }

        this.applicationTarget.onUIReady();
    },


    //PROCESS FUNCTIONS---------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------

    processChildren:function(UICComponent,UIItemTarget,data){
        if(data.UII){
            data.UII = SBJSCore.forceDataToArray(data.UII);

            for(var i=0;i<data.UII.length;i++){
                var uii = data.UII[i];
                var UIItemTargetChild = this["build"+uii.TYPE.nodeValue]( UICComponent,uii);
                var mapToProperty;
                if(uii.MAP_TO_PROPERTY !== null && uii.MAP_TO_PROPERTY !== undefined){
                    mapToProperty =uii.MAP_TO_PROPERTY.nodeValue;
                }
                if(uii.COLOR){
                    UIItemTargetChild.domElementContentJQ.css("background-color",uii.COLOR.nodeValue);
                }
                 if(uii.THUMB){
                    UIItemTargetChild.domElementContentJQ.css("background-image",  'url("'+ this.dataUI.ROOT.URLS[uii.THUMB.nodeValue].nodeValue+'")'   );
                }
                
                UIItemTarget.addChild(UIItemTargetChild,mapToProperty);
                    
            }
        }    
    },    

    processSelectionGroups:function(UICComponent,UIItemTarget,data){

        //this build selection groups to reference and use , called from controller
        if(data.SELECTION_GROUPS){
            for(var prop in data.SELECTION_GROUPS){
                var group =  UICComponent.selectionGroups[prop] = new SBJS_UICore.UISelectionGroup();
                this.processDataProperties(group,data.SELECTION_GROUPS[prop]); 
            }
        }

        //this sets selection groups to references , called from uiItems that are not the controller
        if(data.SELECTION_GROUP){
            UIItemTarget.assignToSelectionGroup(UICComponent.selectionGroups[data.SELECTION_GROUP.nodeValue]);
        }
    
    },
    processVisibilityFilters:function(UIItemTarget,data){
   
        if(data.VISIBILITY_FILTER){
            data.VISIBILITY_FILTER =  SBJSCore.forceDataToArray(data.VISIBILITY_FILTER);
            var a = [];
            for (var i = 0; i < data.VISIBILITY_FILTER.length; i++) {
                var fd = new SBJS_UICore.UIFilter();
                this.processDataProperties(fd,data.VISIBILITY_FILTER[i]);                
                a.push(fd);
            }
            
            UIItemTarget.visibilityFilterTargets = a;
            
        }
    },
    buildUIItemSpecials:function(UICComponent,UIItemTarget,data){


        var label;       
        if(data.LABEL){
            label = this["build"+data.LABEL.UII.TYPE.nodeValue](UICComponent,data.LABEL.UII);       
        }
        if(label !== null && label !== undefined){
            var mapToProperty = "label";
            if(data.LABEL.UII.MAP_TO_PROPERTY !== null && data.LABEL.UII.MAP_TO_PROPERTY !== undefined){
                mapToProperty =data.LABEL.UII.MAP_TO_PROPERTY.nodeValue;
            }
            UIItemTarget.name = label.name;
            UIItemTarget.addChild(label,mapToProperty);          
        }

         var icon;
        if(data.ICON){
            icon = this["build"+data.ICON.UII.TYPE.nodeValue](UICComponent,data.ICON.UII);       
        }

        if(icon !== null && icon !== undefined){
            var mapToProperty = "icon";
            if(data.ICON.UII.MAP_TO_PROPERTY !== null && data.ICON.UII.MAP_TO_PROPERTY !== undefined){
                mapToProperty =data.ICON.UII.MAP_TO_PROPERTY.nodeValue;
            }
            UIItemTarget.addChild(icon,mapToProperty);
           
        }

        var image;
        if(data.ICON_IMAGE){            
            image = this["build"+data.ICON_IMAGE.UII.TYPE.nodeValue](UICComponent,data.ICON_IMAGE.UII);          
        }

        if(image !== null && image !== undefined){
            var mapToProperty = "image";
            if(data.ICON_IMAGE.UII.MAP_TO_PROPERTY !== null && data.ICON_IMAGE.UII.MAP_TO_PROPERTY !== undefined){
                mapToProperty =data.ICON_IMAGE.UII.MAP_TO_PROPERTY.nodeValue;
            }
            UIItemTarget.addChild(image,mapToProperty);           
          
        }       
    },

    processInteractionHooks:function(UIItemTarget,data){


        if(data.INTERACTION_HOOK){
            data.INTERACTION_HOOK = SBJSCore.forceDataToArray(data.INTERACTION_HOOK);
            for(var i=0;i< data.INTERACTION_HOOK.length;i++){
                var ih = data.INTERACTION_HOOK[i];  
                
                var eventData = {};
                if(ih.DATA){
                    if(Array.isArray(ih.DATA)){
                        eventData  = this.processDataProperties(null,ih.DATA);
                    }else{
                        eventData  = this.processDataProperties(eventData,ih.DATA);
                    }
                   
                }
               
               if(ih.FUNCTION){
                    //first see to add a hook into this class if the function exists
                    var functionInternal = this[ih.FUNCTION.nodeValue];              

                    if(functionInternal !== null && functionInternal !== undefined){
                         UIItemTarget.addEventListener(ih.NAME.nodeValue,functionInternal.bind(this),eventData);
                    }
                    //now see to add a hook into the xternal application class if the function exists
                    var functionExternal = this.applicationTarget[ih.FUNCTION.nodeValue];

                    if(functionExternal !== null && functionExternal !== undefined){
                         UIItemTarget.addEventListener(ih.NAME.nodeValue,functionExternal.bind(this.applicationTarget),eventData);
                    } 
                }
                if(ih.EVENT_INTERNAL){
                 
                    eventData.eventName = ih.EVENT_INTERNAL.nodeValue;
                    UIItemTarget.addEventListener(ih.NAME.nodeValue,UIItemTarget.UIItemController.dispatchInternalEvent.bind(UIItemTarget.UIItemController),eventData);
                }
               
        
            }
        }
        if(data.EVENT_INTERNAL_TRIGGER_LISTENER){
            data.EVENT_INTERNAL_TRIGGER_LISTENER = SBJSCore.forceDataToArray(data.EVENT_INTERNAL_TRIGGER_LISTENER);
            for(var i=0;i< data.EVENT_INTERNAL_TRIGGER_LISTENER.length;i++){
                var ih = data.EVENT_INTERNAL_TRIGGER_LISTENER[i]; 
              
                UIItemTarget.UIItemController.addEventListener(ih.nodeValue,UIItemTarget.eventInternalTriggerListener.bind(UIItemTarget));
            }
        }     
       
    },

    processCSSProperties: function (obRef,data) {
        var  ob = obRef;
        
        if (data.CSS) {
            data.CSS = SBJSCore.forceDataToArray(data.CSS);

            for (var i = 0; i < data.CSS.length; i++) {
                var p = data.CSS[i];
                if(obRef.setCSS !== null && obRef.setCSS !== undefined){
                    obRef.setCSS(p.nodeValue);
                }else{
                    SBJSCore.HTMLDomFactory.setClassOrID(obRef,p.nodeValue);
                }           

            }
        }       

    },
    processSingleProperty:function(target,data){
       var targetToUse = target;
       var isArray = false;
       if(Array.isArray(target)){
            targetToUse = {};
            isArray = true;
        }
        if(data.PROPERTY){
            data.PROPERTY =  SBJSCore.forceDataToArray(data.PROPERTY );

            for (var i = 0; i < data.PROPERTY.length; i++) {
                var p = data.PROPERTY[i];
          
                switch (p.TYPE.nodeValue) {
                    case "string":
                    targetToUse[p.KEY.nodeValue] = p.VALUE.nodeValue;
                    break;
                    case "boolean":
                    targetToUse[p.KEY.nodeValue] = p.VALUE.nodeValue === "true";
                    break;
                    case "float":
                    targetToUse[p.KEY.nodeValue] = parseFloat(p.VALUE.nodeValue);
                    break;
                    case "function":
                    //functions are not mapped to the local object but to the class instead
                    targetToUse[p.KEY.nodeValue] = this[p.VALUE.nodeValue];
                    break;
                }

            }
        }
        if(isArray){
            target.push(targetToUse);
        }
    
    },

    processDataProperties :function(obRef,data){
        data =  SBJSCore.forceDataToArray(data);
        var ob;
        if(obRef !== null && obRef !== undefined){
        //if you pass in a object to receive the data , and the data is an array it is possible properties with the same name will just overwrite each other
            ob = obRef;
        }else{
        // when you dont pass in a reference it will always set up an array to manage not to overwrite propertis
           ob = [];
           
        }

        for (var i = 0; i < data.length; i++) {
         var d = data[i];
         this.processSingleProperty(ob,d);

        }      

        return ob;
    
    }, 

    //EVENT LISTENER FUNCTIONS---------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------

    
   
    getNextThemeIndex:function(event){ 
      
         this.dataUIThemesIndex++;
         if(this.dataUIThemesIndex >= this.dataUIThemes.ROOT.THEME_SET.length){
                this.dataUIThemesIndex = 0;
         }
        return this.dataUIThemesIndex; 
                
    },
    setOrientation :function(isLandscape){

        if(isLandscape){
            this.removeAssetVisibilityFilter({data:{filter:"orientationportrait"}},true);
        }else{
            this.setAssetVisibilityFilter({data:{filter:"orientationportrait"}},true);
        }

        for(var prop in this.UIIControllerComponents){
            this.UIIControllerComponents[prop].setOrientation(isLandscape);              
        }
    },
    setAssetVisibilityFilter:function(event,forceConditional){
      
        if(forceConditional || event.UIItemTarget.isSelected ){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                     var val;
                    if(event.data[i].filterValue !== null && event.data[i].filterValue !== undefined ){
                        val = event.data[i].filterValue;
                    }
                    for(var prop in this.UIIControllerComponents){
                        this.UIIControllerComponents[prop].setAssetVisibilityFilter(event.data[i].filter,val);             
                    }
                }
    
            }else{
                var val;
                if(event.data.filterValue !== null && event.data.filterValue !== undefined ){
                    val = event.data.filterValue;
                }
                for(var prop in this.UIIControllerComponents){
                    this.UIIControllerComponents[prop].setAssetVisibilityFilter(event.data.filter,val);             
                }
            }
            for(var prop in this.UIIControllerComponents){
                this.UIIControllerComponents[prop].invalidateAssetsForVisibilityFilters();            
            }             
        }      
    },

    removeAssetVisibilityFilter:function(event,forceConditional){  
       
        if(forceConditional || event.UIItemTarget.isSelected){
            if(Array.isArray(event.data)){
                for(var i=0;i<event.data.length;i++){
                    
                    for(var prop in this.UIIControllerComponents){
                        this.UIIControllerComponents[prop].removeAssetVisibilityFilter(event.data[i].filter);             
                    }
                }
    
            }else{
                for(var prop in this.UIIControllerComponents){
                    this.UIIControllerComponents[prop].removeAssetVisibilityFilter(event.data.filter);             
                }
            }
            for(var prop in this.UIIControllerComponents){
                this.UIIControllerComponents[prop].invalidateAssetsForVisibilityFilters();            
            }             
        }      
       

    },
    setTheme :function(index){
    
        //set theme

        //first invalidate the hightlight objects values since the ui will need to have these set right before they are invalidated
         SBJS_UIHilights.actions.setTheme(this.dataUIThemes.ROOT.THEME_SET[index].HILIGHT_ACTIONS);

         //now do the ui
        for(var prop in this.UIIControllerComponents){
            this.UIIControllerComponents[prop].setTheme(this.dataUIThemes.ROOT.THEME_SET[index]);
            //resize
            if(this.buildComplete === true){
                this.UIIControllerComponents[prop].resize();
            }
        }
    }
}


var inherit_1 = Object.create(SBJSCore.UIItemEventDispatcher.prototype);
Object.assign(inherit_1, SBJS_UIBuildPrototype);
SBJS_UIBuild.prototype = inherit_1;

