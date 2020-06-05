//code by shaderbytes//

function SketchfabAPIUCore(urlIDRef, iframeRef, clientInitObjectRef) {

    //REFERENCES -----------------------------------------------------------------------------------------------------------------------------

    var classScope = this;
    this.version = "4.0.0.0";
    this.api = null;
    this.client = null;
    this.iframe = iframeRef;
    this.urlID = urlIDRef;
    var inspector;
    this.clientInitObject = { "merge_materials": 0, "graph_optimizer": 0 };//if you want any default init options hard coded just add them here
    if (clientInitObjectRef !== null) {
        for (var prop in clientInitObjectRef) {
            classScope.clientInitObject[prop] = clientInitObjectRef[prop];

        }
    }
   
    //----------------------------------------------------------------------------------------------------------------------------------------
    //BOOLEANS--------------------------------------------------------------------------------------------------------------------------------

    this.moduleReady = false;
    this.apiReady = false;
    this.enableDebugLogging = true;
    //---------------------------------------------------------------------------------------------------------------------------------------- 
    //OBJECTS / STORAGE ----------------------------------------------------------------------------------------------------------------------  
    this.eventListeners = {};
    this.modules = {};
    //----------------------------------------------------------------------------------------------------------------------------------------
    //TYPED NAMES ----------------------------------------------------------------------------------------------------------------------------     

    //EVENTS
    this.EVENT_INITIALIZED = "initialized"; 
    this.EVENT_ERROR = "error";  
   
    //-------------------------------------------------------------------------------------------------------------------------
   // the event for all errors  "EVENT_ERROR" , in the object passed will be a sub type to filter and identify the type of error.
    this.throwError = function(type ,message){
    
     classScope.dispatchEvent(classScope.EVENT_ERROR, {type:type,message:message});
    }

    this.invalidateModule = function (key) {
        if (inspector !== null && inspector !== undefined) {
            inspector.invalidateModule(key);
        }
    }

    this.addInspector = function (inspectorRef) {
        inspector = inspectorRef;
        inspector.create(classScope);

    }
    this.addModule = function (module) {
        if (module.hasOwnProperty("key")) {
            classScope.modules[module.key] = module;
            //if the api is ready then it means this module is being create post the utility ready , so the call to create it must be added here.
            if (classScope.apiReady) {
                module.create(classScope);
            }


        } else {
            classScope.throwError(module.EVENT_ERROR, 'addModule  called in SketchfabAPIUCore and the agument does not seem to have the property key, so nothing was added');
        }
        
    }

    this.create = function () {
 
       
        classScope.client = new Sketchfab(classScope.iframe);
        classScope.clientInitObject.success = classScope.onClientInit;
        classScope.clientInitObject.error = classScope.onClientError;
        classScope.client.init(classScope.urlID, classScope.clientInitObject);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.onClientError = function () {
     
        classScope.throwError(classScope.EVENT_ERROR, 'a call to "init()" on the sketchfab client object has failed');
      
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.onClientInit = function (apiRef) {
  
        classScope.api = apiRef;
        //api.start();
        classScope.api.addEventListener('viewerready', classScope.onViewerReady);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.onViewerReady = function () {
    
        classScope.apiReady = true;

        //create modules if they exist.
        for (var prop in classScope.modules) {
            classScope.modules[prop].create(classScope);            
        }
        classScope.validateModulesReady();
    };
 

    this.validateModulesReady = function () {
   
        //validate modules if they exist

        var allModulesReady = true;

        for (var prop in classScope.modules) {
            if (!classScope.modules[prop].moduleReady) {
                allModulesReady = false;
              
            } else {

                //check for inspectors and create them if not already created.
                if (inspector !== null && inspector !== undefined) {
                    var inspectorTemp = inspector.modules[classScope.modules[prop].key];
                    if (inspectorTemp !== null && inspectorTemp !== undefined) {
                        if (!inspectorTemp.moduleReady) {
                            inspectorTemp.create(classScope.modules[prop], inspector);
                        }

                    }
                }

            }
        }
       
       
        if (allModulesReady) {
            if (!classScope.moduleReady) {
                classScope.moduleReady = true;
                classScope.dispatchEvent(classScope.EVENT_INITIALIZED, true);
              
            }
           

        }
    };

   

    this.addEventListener = function (event, func) {
        if (classScope.eventListeners[event] === null || classScope.eventListeners[event] === undefined) {
            classScope.eventListeners[event] = [];
           
        }
        classScope.eventListeners[event].push(func);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.removeEventListener = function (event, func) {
        if (classScope.eventListeners[event] !== null) {
            for (var i = classScope.eventListeners[event].length - 1; i >= 0; i--) {
                if (classScope.eventListeners[event][i] == func) {
                    classScope.eventListeners[event].splice(i, 1);
                }
            }
            if (classScope.eventListeners[event].length === 0) {
                classScope.eventListeners[event] = null;
               
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.dispatchEvent = function (eventName, eventObject) {

        var eventArray = classScope.eventListeners[eventName];
        if (eventArray !== null && eventArray !== undefined) {
            for (var i = 0; i < eventArray.length; i++) {
                eventArray[i](eventObject);
            }
        }
    };  

    //-------------------------------------------------------------------------------------------------------------------------- 

    

    
};

