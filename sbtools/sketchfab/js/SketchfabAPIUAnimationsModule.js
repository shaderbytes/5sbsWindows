function SketchfabAPIUAnimationsModule() {
   
    //OBJECTS / STORAGE --------------------------------------------------------------------------------------------------------
    var classScope = this;
    var sketchfabAPIUtilityCore;
    this.animationClipsLength = 0;     
    this.animationClips = {};
    this.currentAnimationObject = {};

    //TYPED NAMES -------------------------------------------------------------------------------------------------------------- 
    this.CYCLE_MODE_LOOP_ONE = "loopOne";
    this.CYCLE_MODE_LOOP_ALL = "loopAll";
    this.CYCLE_MODE_ONE = "one";
    this.CYCLE_MODE_ALL = "all";
   
    this.key = "animations";

    //EVENTS
    this.ANIMATION_ENDED = "animationEnded";
  

    //BOOLEANS------------------------------------------------------------------------------------------------------------------
    this.moduleReady = false;
    //--------------------------------------------------------------------------------------------------------------------------   

    //IF you set this module reference before calling create on the Utility , there is no need to call this module create manually, 
    //the utility will do it for you. If you are adding this after the utility is created itself then you do need to call this manually.
    // it will additionally check whether the utility is ready itself.
    this.create = function (sketchfabAPIUtilityCoreRef) {
      sketchfabAPIUtilityCore = sketchfabAPIUtilityCoreRef;
        if (!sketchfabAPIUtilityCore.apiReady) {            
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"create" function in AmimationModule has failed , sketchfabAPIUtilityCore.apiReady is false');  
            return;
        }
      
        sketchfabAPIUtilityCore.api.getAnimations(generateAnimationControls);
    };

    //--------------------------------------------------------------------------------------------------------------------------
    // use var here so the function is not exposed to users being able to reference it and call it outside of this object scope.   

    var generateAnimationControls = function (err, animations) {
        if (err) {           
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"getAnimations" function in AnnotationModule has failed '+ err);
            return;
        }
        if (sketchfabAPIUtilityCore.enableDebugLogging) {
            console.log("animation listing");
            console.log(animations);
        }

        for (var i = 0; i < animations.length; i++) {

            var ob = classScope.animationClips[animations[i][1]] = {};
            ob.name = animations[i][1];
            ob.uid = animations[i][0];
            ob.length = animations[i][2];

        }
        classScope.animationClipsLength = animations.length;

        classScope.moduleReady = true;
        classScope.validateModulesReady();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.getAnimationObject = function (key) {
        var dataObjectRef = classScope.animationClips[key];
        if (dataObjectRef === null) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR,'getAnimationObject in AnimationModule has failed. using key/name ' + key + '  - no such object found');            
            return null;
        }
        return dataObjectRef;
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setAnimation = function (key) {
        var dataObjectRef = classScope.getAnimationObject(key);

        if (dataObjectRef != null) {
            classScope.currentAnimationObject = dataObjectRef;
            sketchfabAPIUtilityCore.api.setCurrentAnimationByUID(dataObjectRef.uid);
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.seekTo = function (seconds) {
        if (seconds > classScope.currentAnimationObject.length) {
            console.warn('"seekTo" function called and the "seconds" argument is greater than the current animation length -  investigate your code..');
            seconds = classScope.currentAnimationObject.length;
        }
        sketchfabAPIUtilityCore.api.seekTo(seconds);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.pause = function () {
        sketchfabAPIUtilityCore.api.pause();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.play = function () {
        sketchfabAPIUtilityCore.api.play();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.getCurrentTime = function () {
        sketchfabAPIUtilityCore.api.getCurrentTime(function (err, time) {
            if (err) {
                sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"getCurrentTime" function in AnnotationModule has failed '+ err);               
                return;
            }
            return time;
        });
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setSpeed = function (speed) {
        api.setSpeed(speed);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setCycleMode = function (cycleMode) {
        sketchfabAPIUtilityCore.api.setCycleMode(cycleMode);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.addEventListener = function (event, func) {
        if (sketchfabAPIUtilityCore.eventListeners[event] === null || sketchfabAPIUtilityCore.eventListeners[event] === undefined) {
            sketchfabAPIUtilityCore.eventListeners[event] = [];           

            if (event == classScope.ANIMATION_ENDED) {

                if (classScope.moduleReady) {
                    sketchfabAPIUtilityCore.api.addEventListener(classScope.ANIMATION_ENDED, classScope.onAnimationEnded);
                } else {                    
                     sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"addEventListener" function in AnimationModule has failed, tried to added event ANIMATION_ENDED but moduleReady is false'); 
                    return;
                }
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
                

                if (event == classScope.ANIMATION_ENDED) {
                    sketchfabAPIUtilityCore.api.removeEventListener(classScope.ANIMATION_ENDED, classScope.onAnimationEnded);
                }
            }
        }
    };







};