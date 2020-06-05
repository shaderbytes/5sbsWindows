function SketchfabAPIUAnnotationsModule() {
   
    
    //OBJECTS / STORAGE --------------------------------------------------------------------------------------------------------
    var classScope = this;
    var sketchfabAPIUtilityCore;
    this.annotations = [];
    this.animationClips = {};
    this.annotationLength = 0;
    this.animationClipsLength = 0;
    this.currentAnnotationIndex = -1;
    this.currentAnnotationObject;

     this.key = "annotations";

    //TYPED NAMES -------------------------------------------------------------------------------------------------------------- 
    this.EVENT_ANNOTATION_CHANGED = "annotationSelect";
    this.EVENT_ANNOTATION_MOUSE_ENTER = "annotationMouseEnter";
    this.EVENT_ANNOTATION_MOUSE_LEAVE = "annotationMouseLeave";
   
   
    
   
    //BOOLEANS------------------------------------------------------------------------------------------------------------------
    this.moduleReady = false;
    //--------------------------------------------------------------------------------------------------------------------------   

    //IF you set this module reference before calling create on the Utility , there is no need to call this module create manually, 
    //the utility will do it for you. If you are adding this after the utility is created itself then you do need to call this manually.
    // it will additionally check whether the utility is ready itself.
    this.create = function (sketchfabAPIUtilityCoreRef) {
     sketchfabAPIUtilityCore = sketchfabAPIUtilityCoreRef;
        if (!sketchfabAPIUtilityCore.apiReady) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"create" function in AnnotationModule has failed , sketchfabAPIUtilityCore.apiReady is false');           
            return;
        }
       
        sketchfabAPIUtilityCore.api.getAnnotationList(generateAnnotationControls);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.annotationChanged = function (index) {
       

        if (isNaN(index)) {
            return;
        }
        if (index === -1) {
            return;
        }
        classScope.currentAnnotationIndex = index;
        classScope.currentAnnotationObject = classScope.annotations[classScope.currentAnnotationIndex];
        sketchfabAPIUtilityCore.dispatchEvent(classScope.EVENT_ANNOTATION_CHANGED, classScope.currentAnnotationObject);
    };

    //--------------------------------------------------------------------------------------------------------------------------
    // use var here so the function is not exposed to users being able to reference it and call it outside of this object scope.
    var generateAnnotationControls = function (err, annotations) {
        if (err) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"getAnnotationList" function in AnnotationModule has failed '+ err);             
            return;
        }
        if (sketchfabAPIUtilityCore.enableDebugLogging) {
            console.log("annotations listing");
            console.log(annotations);
        }

        classScope.annotations = annotations;
        classScope.annotationLength = annotations.length;
        for (var i = 0; i < annotations.length; i++) {
            classScope.annotations[i].description = classScope.annotations[i].content.raw || "";
        }

        classScope.moduleReady = true;

        if (classScope.annotationLength > 0) {
            sketchfabAPIUtilityCore.api.addEventListener(classScope.EVENT_ANNOTATION_CHANGED, classScope.annotationChanged);
        }

        sketchfabAPIUtilityCore.validateModulesReady();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.gotoNextAnnotation = function () {
      
        if (classScope.annotationLength === 0) return;
        classScope.currentAnnotationIndex++;
      
        if (classScope.currentAnnotationIndex >= classScope.annotationLength) {
            classScope.currentAnnotationIndex = 0;
        }
        classScope.currentAnnotationObject = classScope.annotations[classScope.currentAnnotationIndex];
        sketchfabAPIUtilityCore.api.gotoAnnotation(classScope.currentAnnotationIndex);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.gotoPreviousAnnotation = function () {
        if (classScope.annotationLength === 0) return;
        classScope.currentAnnotationIndex--;
        if (classScope.currentAnnotationIndex < 0) {
            classScope.currentAnnotationIndex = classScope.annotationLength - 1;
        }
        classScope.currentAnnotationObject = classScope.annotations[classScope.currentAnnotationIndex];
        sketchfabAPIUtilityCore.api.gotoAnnotation(classScope.currentAnnotationIndex);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.gotoAnnotation = function (index) {
        if (classScope.annotationLength === 0) return;
        if (isNaN(index)) {           
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"gotoAnnotation" function in AnnotationModule has failed, it requires you pass in a number for the index');         
            return;
        }

        //cap the ranges incase they are out of bounds
        if (index >= classScope.annotationLength) {
            index = classScope.annotationLength - 1;
        } else if (index < 0) {
            index = 0;
        }
        classScope.currentAnnotationIndex = index;
        classScope.currentAnnotationObject = classScope.annotations[classScope.currentAnnotationIndex];
        sketchfabAPIUtilityCore.api.gotoAnnotation(classScope.currentAnnotationIndex);

    };


    //--------------------------------------------------------------------------------------------------------------------------

    this.onAnnotationMouseEnter = function (index) {
      
        if (isNaN(index)) {
            return;
        }
        if (index === -1) {
            return;
        }
        sketchfabAPIUtilityCore.dispatchEvent(classScope.EVENT_ANNOTATION_MOUSE_ENTER, classScope.annotations[index]);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.onAnnotationMouseLeave = function (index) {
      
        if (isNaN(index)) {
            return;
        }
        if (index === -1) {
            return;
        }
        sketchfabAPIUtilityCore.dispatchEvent(classScope.EVENT_ANNOTATION_MOUSE_LEAVE, classScope.annotations[index]);
    };

    //--------------------------------------------------------------------------------------------------------------------------


    this.addEventListener = function (event, func) {
        if (sketchfabAPIUtilityCore.eventListeners[event] === null || sketchfabAPIUtilityCore.eventListeners[event] === undefined) {
            sketchfabAPIUtilityCore.eventListeners[event] = [];          
        }

      
        if (event == classScope.EVENT_ANNOTATION_MOUSE_ENTER) {

            if (classScope.moduleReady) {
                sketchfabAPIUtilityCore.api.addEventListener(classScope.EVENT_ANNOTATION_MOUSE_ENTER, classScope.onAnnotationMouseEnter);
            } else {
                sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"addEventListener" function in AnnotationModule has failed, tried to added event EVENT_ANNOTATION_MOUSE_ENTER but moduleReady is false');               
                return;
            }

        }

        if (event == classScope.EVENT_ANNOTATION_MOUSE_LEAVE) {

            if (classScope.moduleReady) {
                sketchfabAPIUtilityCore.api.addEventListener(classScope.EVENT_ANNOTATION_MOUSE_LEAVE, classScope.onAnnotationMouseLeave);
            } else {                
                sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"addEventListener" function in AnnotationModule has failed, tried to added event EVENT_ANNOTATION_MOUSE_LEAVE but moduleReady is false');               
                return;
            }
        }

        sketchfabAPIUtilityCore.eventListeners[event].push(func);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.removeEventListener = function (event, func) {
        if (sketchfabAPIUtilityCore.eventListeners[event] !== null) {
            for (var i = sketchfabAPIUtilityCore.eventListeners[event].length - 1; i >= 0; i--) {
                if (sketchfabAPIUtilityCore.eventListeners[event][i] == func) {
                    sketchfabAPIUtilityCore.eventListeners[event].splice(i, 1);
                }
            }
            if (sketchfabAPIUtilityCore.eventListeners[event].length === 0) {
                sketchfabAPIUtilityCore.eventListeners[event] = null;
               

                if (event == classScope.EVENT_ANNOTATION_MOUSE_ENTER) {
                    sketchfabAPIUtilityCore.api.removeEventListener(classScope.EVENT_ANNOTATION_MOUSE_ENTER, classScope.onAnnotationMouseEnter);
                }

                if (event == classScope.EVENT_ANNOTATION_MOUSE_LEAVE) {
                    sketchfabAPIUtilityCore.api.removeEventListener(classScope.EVENT_ANNOTATION_MOUSE_LEAVE, classScope.onAnnotationMouseLeave);
                }
            }
        }
    };


    //--------------------------------------------------------------------------------------------------------------------------


   


};