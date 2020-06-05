function SketchfabAPIUInspector() {


    ExpansionComponent.call(this);
    SketchfabAPIUInspector.prototype = Object.create(ExpansionComponent.prototype);

    //REFERENCES -----------------------------------------------------------------------------------------------------------------------------
    var classScope = this;
    var sketchfabAPIUtilityInstance;
    this.moduleHeadersContainerJQ;
    this.moduleContentContainerJQ;
    var objectPositionCachedX;
    var objectPositionCachedY;
    var mousePositionCashedX;
    var mousePositionCashedY;
    var isContentVisible;  
    this.domFactory;

    //OBJECTS / STORAGE ----------------------------------------------------------------------------------------------------------------------     
    this.modules = {};
    //BOOLEANS--------------------------------------------------------------------------------------------------------------------------------
    this.moduleReady = false;
    //----------------------------------------------------------------------------------------------------------------------------------------   

    this.create = function (sketchfabAPIUtilityInstanceRef) {
        //create controller
        var selectionController = new UISelectionsController();
        //create expansion ------------

        classScope.containerClassName = "SAPIUInspectorContainer";
        classScope.headClassName = "SAPIUInspectorHead";
        classScope.contentClassName = "SAPIUInspectorContent";
        classScope.label = "API Utility Inspector";
        classScope.expandIcon = "shaderbytes/images/magnify_minus.svg";
        classScope.contractIcon = "shaderbytes/images/magnify_plus.svg";
        classScope.createExpansionComponent(selectionController);
        var selectionGroup = new UISelectionGroup();
        console.log("selectionGroup");
        console.log(selectionGroup);
        selectionGroup.deselectSelf = true;
        classScope.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
       
        //----------------------------           

        sketchfabAPIUtilityInstance = sketchfabAPIUtilityInstanceRef;
        document.body.appendChild(classScope.containerJQ[0]);
        classScope.headJQ.on("mousedown.exdiv touchstart.exdiv", classScope.setMouseDragLinear);

        //add interaction
        classScope.containerJQ.on("click touch", "." + selectionController.UID, selectionController.onInteraction);

    };

    //-----------------------------------------------------------------------------------------------------------------

    this.setMouseDragLinear = function (e) {

        mousePositionCashedX = e.pageX;
        mousePositionCashedY = e.pageY;
        var p = classScope.containerJQ.position();
        objectPositionCachedX = p.left;
        objectPositionCachedY = p.top;
        $(document).on("mousemove.exdiv touchmove.exdiv", classScope.calculateMouseMove);
        $(document).on("mouseup.exdiv touchend.exdiv", classScope.onBodyMouseUp);
    };

    //-----------------------------------------------------------------------------------------------------------------

    this.calculateMouseMove = function (e) {
        classScope.UISelectionItemHead.ignoreClickOnce = true;
        var xdiff = e.pageX - mousePositionCashedX;
        var ydiff = e.pageY - mousePositionCashedY;
        var l = (objectPositionCachedX + xdiff);
        var t = (objectPositionCachedY + ydiff);
        classScope.containerJQ.css("left", l + "px");
        classScope.containerJQ.css("top", t + "px");
    };

    //-----------------------------------------------------------------------------------------------------------------

    this.onBodyMouseUp = function () {
        $(document).off("mousemove.exdiv touchmove.exdiv");
        $(document).off("mouseup.exdiv touchend.exdiv");
      
    };

    //-----------------------------------------------------------------------------------------------------------------   

    this.invalidateModule = function (key) {
        var moduletemp = classScope.modules[key];
        if (moduletemp !== null && moduletemp !== undefined) {
            moduletemp.invalidate();
        }
    };

    //-----------------------------------------------------------------------------------------------------------------

    this.addModule = function (module) {
        if (module.hasOwnProperty("key")) {
            // add module          
            classScope.modules[module.key] = module;
            // only if the target of the inspector exists and is ready can you create it fully , otherwise creation is deferred.
            var target = sketchfabAPIUtilityInstance.modules[module.key];
            if (target !== null && target !== undefined) {
                if (target.moduleReady) {
                    module.create(target, classScope);
                }
            }
        } else {
            conole.error('addModule  called in SketchfabAPIUInspector and the agument does not seem to have the property key, so nothing was added');
        }

    };

    //-----------------------------------------------------------------------------------------------------------------   


};









