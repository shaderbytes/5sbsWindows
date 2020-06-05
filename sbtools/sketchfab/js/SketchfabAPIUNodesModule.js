function SketchfabAPIUNodesModule() {

     var classScope = this;

    //TYPED NAMES -------------------------------------------------------------------------------------------------------------- 

    //nodeHash keys per type
    this.nodeTypeMatrixtransform = "MatrixTransform";
    this.nodeTypeGeometry = "Geometry";
    this.nodeTypeGroup = "Group";
    this.nodeTypeRigGeometry = "RigGeometry";

     this.key = "nodes";

    //events
    this.EVENT_CLICK = "click";
    this.EVENT_MOUSE_ENTER = "nodeMouseEnter";
    this.EVENT_MOUSE_LEAVE = "nodeMouseLeave";
  

   

    //OBJECTS / STORAGE --------------------------------------------------------------------------------------------------------

    var classScope = this;
    var sketchfabAPIUtilityCore;
    this.nodesRaw = null;
    this.nodeHash = {};
    this.nodeHashIDMap = {};
    classScope.nodeHash[classScope.nodeTypeMatrixtransform] = {};
    classScope.nodeHash[classScope.nodeTypeGroup] = {};
    classScope.nodeHash[classScope.nodeTypeGeometry] = {};   
    classScope.nodeHash[classScope.nodeTypeRigGeometry] = {};

    //BOOLEANS------------------------------------------------------------------------------------------------------------------

    this.moduleReady = false;

    //--------------------------------------------------------------------------------------------------------------------------  


    //IF you set this module reference before calling create on the Utility , there is no need to call this module create manually, 
    //the utility will do it for you. If you are adding this after the utility is created itself then you do need to call this manually.
    // it will additionally check whether the utility is ready itself.
    this.create = function (sketchfabAPIUtilityCoreRef) {
      sketchfabAPIUtilityCore = sketchfabAPIUtilityCoreRef;
        if (!sketchfabAPIUtilityCore.apiReady) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"create" function in NodesModule has failed , sketchfabAPIUtilityCoreRef.apiReady is false');           
            return;
        }

      
        sketchfabAPIUtilityCore.api.getSceneGraph(generateNodeHashRecursive);
    };

    //--------------------------------------------------------------------------------------------------------------------------   
    // use var here so the function is not exposed to users being able to reference it and call it outside of this object scope.
    //--------------------------------------------------------------------------------------------------------------------------

    var generateNodeHashRecursive = function (err, root) {

        if (err) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"getSceneGraph" function in NodesModule has failed '+ err);  
          
            return;
        }
        classScope.nodesRaw = root;

        var types = [classScope.nodeTypeMatrixtransform, classScope.nodeTypeGeometry, classScope.nodeTypeGroup, classScope.nodeTypeRigGeometry];

        classScope.handleNode(root, types, null);

        if (sketchfabAPIUtilityCore.enableDebugLogging) {
            for (var m = 0; m < types.length; m++) {
                console.log(" ");
                console.log("nodes listing " + types[m]);
                var p = classScope.nodeHash[types[m]];
                for (var key in p) {
                    if (Array.isArray(p[key])) {
                        console.log("multiple nodes with same name ,use name and index to reference a single instance, if no index is passed in conjunction with this name, all nodes with this name would be affected: ");
                        for (var i = 0; i < p[key].length; i++) {
                            console.log("name: " + p[key][i].name + " index: " + i);
                        }
                    } else {
                        console.log("unique node name, use only name to retrieve: ");
                        console.log("name: " + p[key].name);
                    }
                }
            }
        }

        classScope.moduleReady = true;
        sketchfabAPIUtilityCore.validateModulesReady();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.validateNodeName = function (nodeNameRef) {
        if (nodeNameRef === null || nodeNameRef === undefined) {
            console.warn("validateNodeName callid in SketchfabAPIUNodesModule but the argument nodeNameRef is null or undefined, so false will be returned without any validation logic performed");
            return false;
        }
        var nodeName = nodeNameRef.split(" ").join("").toLowerCase();

        if (nodeName === null || nodeName === undefined) {

            return false;
        }

        if (typeof (nodeName) == "string") {

            if (nodeName.length === 0) {

                return false;
            }
            if (nodeName == "rootmodel") {

                return false;
            }

            if (nodeName.indexOf("rootnode") != -1) {

                return false;
            }

            if (nodeName == "scene-polygonnode") {

                return false;
            }
            if (nodeName.indexOf("fbx") != -1) {

                return false;
            }



            if (nodeName.indexOf("undefined") != -1) {

                return false;
            }
        }

        return true;

    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.generateNodeName = function (node) {
        if (node.name === null || node.name === undefined || node.name === "undefined") {
            return "undefined_" + node.instanceID;
        } else {
            return node.name;
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.handleNode = function (node, types, parent) {
       
        if (types.indexOf(node.type) >= 0) {


            var nodeTypeCurrent = node.type;
            var nodeNameCurrent = classScope.generateNodeName(node);
            node.name = nodeNameCurrent;

            var n = classScope.nodeHash[nodeTypeCurrent];

            node.isVisible = true;
            if (nodeTypeCurrent == classScope.nodeTypeMatrixtransform) {
                node.transform = new TransformNodes(sketchfabAPIUtilityCore, classScope, node);
            }
            node.parent = parent;
            node.index = 0;

            if (n[nodeNameCurrent] !== undefined && n[nodeNameCurrent] !== null) {

                if (!Array.isArray(n[nodeNameCurrent])) {

                    var nodeTemp = n[nodeNameCurrent];
                    n[nodeNameCurrent] = null;
                    n[nodeNameCurrent] = [];
                    n[nodeNameCurrent].push(nodeTemp);
                    nodeTemp.index = n[nodeNameCurrent].length - 1;
                    n[nodeNameCurrent].push(node);
                    node.index = n[nodeNameCurrent].length - 1;
                    classScope.nodeHashIDMap[node.instanceID] = n[nodeNameCurrent];

                } else {
                    n[nodeNameCurrent].push(node);
                    node.index = n[nodeNameCurrent].length - 1;
                    classScope.nodeHashIDMap[node.instanceID] = n[nodeNameCurrent];
                }

            } else {
                n[nodeNameCurrent] = node;
                classScope.nodeHashIDMap[node.instanceID] = n[nodeNameCurrent];
            }
            if (node.children === null || node.children === undefined) {
                return;
            }

            if (node.children.length === 0) {
                return;
            } else {

                // recurse through the children
                for (var i = 0; i < node.children.length; i++) {
                    var child = node.children[i];
                    this.handleNode(child, types, node);
                }
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    // key can be a name or an instance id.
    this.getObject = function (key, nodeIndex, currentNodeType) {
        if (!classScope.moduleReady) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"getObject" function in NodesModule has failed, moduleReady is false');
           
            return;
        }
        var dataObjectRef;
        var nodeTypeCurrent = currentNodeType || classScope.nodeTypeMatrixtransform;

        if (typeof key === 'string' || key instanceof String) {
            dataObjectRef = classScope.nodeHash[nodeTypeCurrent][key];

        } else {
            dataObjectRef = classScope.nodeHashIDMap[key];
        }


        if (dataObjectRef === null || dataObjectRef === undefined) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR,  '"getObject" function in NodesModule has failed, using list id "' + nodeTypeCurrent + '"  and using node name "' + key + '" - no such node found');           
            return null;
        }

        if (nodeIndex !== null) {
            if (Array.isArray(dataObjectRef)) {
                if (nodeIndex < 0 || nodeIndex >= dataObjectRef.length) {
                    sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"getObject" function in NodesModule has failed, object is array and nodeIndex is out of range. You can pass an array index ranging : 0 - ' + (dataObjectRef.length - 1));                   
                    return;
                } else {
                    dataObjectRef = dataObjectRef[nodeIndex];
                }
            }
        }

        // take note the returned object could be a direct reference to the node object if it is unique , or it returns an array of node objects if they share the same name
        //or it could be a direct refrence to the node object within the array if you passed in a nodeIndex and the name is mapped to an array

        return dataObjectRef;
    };

    

    //--------------------------------------------------------------------------------------------------------------------------
    
    // this function will bubble the object graph until an object of type group is found
    this.getfirstAncestorOfTypeGroup = function (node) {
        var firstAncestorOfTypeGroup = node.parent;
        if (firstAncestorOfTypeGroup !== null && firstAncestorOfTypeGroup !== undefined) {
            while (firstAncestorOfTypeGroup.type !== classScope.nodeTypeGroup) {
                firstAncestorOfTypeGroup = firstAncestorOfTypeGroup.parent;
            }
        }
        return firstAncestorOfTypeGroup;
    };

    //--------------------------------------------------------------------------------------------------------------------------
    // this function bubble the object graph until an object of type Matrix Transform is found
    this.getfirstAncestorOfTypeMatrixTransform = function (node) {
        var firstAncestorOfTypeMatrixTransform = node.parent;
        if (firstAncestorOfTypeMatrixTransform !== null && firstAncestorOfTypeMatrixTransform !== undefined) {
            while (firstAncestorOfTypeMatrixTransform.type !== classScope.nodeTypeMatrixtransform) {
                firstAncestorOfTypeMatrixTransform = firstAncestorOfTypeMatrixTransform.parent;
            }
        }
        return firstAncestorOfTypeMatrixTransform;
    };

    //--------------------------------------------------------------------------------------------------------------------------   

    this.onClick = function (e) {
        if (e.instanceID === null || e.instanceID === undefined || e.instanceID === -1) {
            return;
        }

        var node = classScope.getObject(e.instanceID);
        e.node = node;
        e.firstAncestorOfTypeGroup = classScope.getfirstAncestorOfTypeGroup(node);
        e.firstAncestorOfTypeMatrixTransform = classScope.getfirstAncestorOfTypeMatrixTransform(node);
        sketchfabAPIUtilityCore.dispatchEvent(classScope.EVENT_CLICK, e);
    };

    //--------------------------------------------------------------------------------------------------------------------------  

    this.onNodeMouseEnter = function (e) {
        if (e.instanceID === null || e.instanceID === undefined || e.instanceID === -1) {
            return;
        }

        var node = classScope.getObject(e.instanceID);
        e.node = node;
        e.firstAncestorOfTypeGroup = classScope.getfirstAncestorOfTypeGroup(node);
        e.firstAncestorOfTypeMatrixTransform = classScope.getfirstAncestorOfTypeMatrixTransform(node);
        sketchfabAPIUtilityCore.dispatchEvent(classScope.EVENT_MOUSE_ENTER, e);
    };

    //--------------------------------------------------------------------------------------------------------------------------  

    this.onNodeMouseLeave = function (e) {
        if (e.instanceID === null || e.instanceID === undefined || e.instanceID === -1) {
            return;
        }

        var node = classScope.getObject(e.instanceID);
        e.node = node;
        e.firstAncestorOfTypeGroup = classScope.getfirstAncestorOfTypeGroup(node);
        e.firstAncestorOfTypeMatrixTransform = classScope.getfirstAncestorOfTypeMatrixTransform(node);
        sketchfabAPIUtilityCore.dispatchEvent(classScope.EVENT_MOUSE_LEAVE, e);
    };

    //--------------------------------------------------------------------------------------------------------------------------  

    this.setNodeVisibilityAll = function (makeVisible, exclusionList, currentNodeType) {
        var useTogglebehaviour = false;
        if (makeVisible === null) {
            useTogglebehaviour = true;
        }
        var nodeTypeCurrent = currentNodeType || classScope.nodeTypeMatrixtransform;
        var data = classScope.nodeHash[nodeTypeCurrent];
        for (var prop in data) {
            //dont process nodes that are excluded via validateNodeName function
            if (!classScope.validateNodeName(prop)) continue;

            var isExcluded = false;
            if (exclusionList !== null && exclusionList !== undefined) {
                for (var i = 0; i < exclusionList.length; i++) {
                    if (exclusionList[i] == prop) {
                        //key matchs exlusion data so do not process further
                        isExcluded = true;
                        break;
                    }
                }
            }
            if (isExcluded) {
                continue;
            }

            var dataObjectRef = classScope.getObject(prop, null, currentNodeType);
            if (dataObjectRef !== null && dataObjectRef !== undefined) {

                //if array
                if (Array.isArray(dataObjectRef)) {
                    for (i = 0; i < dataObjectRef.length; i++) {

                        if (useTogglebehaviour) {
                            dataObjectRef[i].isVisible = !dataObjectRef[i].isVisible
                            makeVisible = dataObjectRef[i].isVisible;
                        } else {
                            if (dataObjectRef[i].isVisible == makeVisible) {
                                //no need to process if the state is already as being requested.
                                continue;
                            }
                        }

                       

                        dataObjectRef[i].isVisible = makeVisible;
                        if (makeVisible) {
                            sketchfabAPIUtilityCore.api.show(dataObjectRef[i].instanceID);
                        } else {
                            sketchfabAPIUtilityCore.api.hide(dataObjectRef[i].instanceID);
                        }
                    }
                } else {
                    //not array
                    if (useTogglebehaviour) {
                        dataObjectRef.isVisible = !dataObjectRef.isVisible
                        makeVisible = dataObjectRef.isVisible;
                    } else {
                        if (dataObjectRef.isVisible == makeVisible) {
                            //no need to process if the state is already as being requested.
                            continue;
                        }

                    }                   

                    dataObjectRef.isVisible = makeVisible;
                    if (makeVisible) {
                        sketchfabAPIUtilityCore.api.show(dataObjectRef.instanceID);
                    } else {
                        sketchfabAPIUtilityCore.api.hide(dataObjectRef.instanceID);
                    }

                }

            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setNodeVisibility = function (key, makeVisible, nodeIndex, currentNodeType) {
        var useTogglebehaviour = false;
        if (makeVisible === null) {
            useTogglebehaviour = true;
        }
        var dataObjectRef = classScope.getObject(key, null, currentNodeType);
        var nodeSingle;
        var loopArray = false;
        var i = 0;
        if (dataObjectRef !== null && dataObjectRef !== undefined) {

            if (Array.isArray(dataObjectRef)) {
                if (nodeIndex === null) {
                    loopArray = true;
                    nodeSingle = dataObjectRef[0];
                } else if (nodeIndex < 0 || nodeIndex >= dataObjectRef.length) {
                    sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"setNodeVisibility" function in NodesModule has failed, key: '+key+' maps to an array object and you passed and invalid index. Either omit this argument to loop the array or pass a valid index. So you can pass null or You can pass an array index ranging : 0 - ' + (dataObjectRef.length - 1));                   
                   
                    return;
                } else {
                    nodeSingle = dataObjectRef[nodeIndex];
                }
            } else {
                nodeSingle = dataObjectRef;
            }

            if (useTogglebehaviour) {
                nodeSingle.isVisible = !nodeSingle.isVisible;
                makeVisible = nodeSingle.isVisible;
            } else {
                if (nodeSingle.isVisible == makeVisible) {
                    //no need to process if the state is already as being requested.
                    return;
                }
            }
           
          
            nodeSingle.isVisible = makeVisible;
            if (loopArray) {
                for (i = 1; i < dataObjectRef.length; i++) {
                    dataObjectRef[i].isVisible = makeVisible;
                }
            }

            if (makeVisible) {

                sketchfabAPIUtilityCore.api.show(nodeSingle.instanceID);
                if (loopArray) {
                    for (i = 1; i < dataObjectRef.length; i++) {
                        sketchfabAPIUtilityCore.api.show(dataObjectRef[i].instanceID);
                    }
                }
            } else {

                sketchfabAPIUtilityCore.api.hide(nodeSingle.instanceID);
                if (loopArray) {
                    for (i = 1; i < dataObjectRef.length; i++) {
                        sketchfabAPIUtilityCore.api.hide(dataObjectRef[i].instanceID);
                    }
                }
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.toggleNodeVisibility = function (key, nodeIndex, currentNodeType) {
        classScope.setNodeVisibility(key, null, nodeIndex, currentNodeType);
    };

    //--------------------------------------------------------------------------------------------------------------------------

   
    this.addEventListener = function (event, func) {
        if (sketchfabAPIUtilityCore.eventListeners[event] === null || sketchfabAPIUtilityCore.eventListeners[event] === undefined) {
            sketchfabAPIUtilityCore.eventListeners[event] = [];           
           
        }

        if (event == classScope.EVENT_CLICK) {
            if (classScope.moduleReady) {
                sketchfabAPIUtilityCore.api.addEventListener(classScope.EVENT_CLICK, classScope.onClick, { pick: 'slow' });
            } else {
                sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, "a call to add a EVENT_CLICK event listener has been rejected because this NodesModule has not completed initialization");               
                return;
            }
        }


        if (event == classScope.EVENT_MOUSE_ENTER) {

            if (classScope.moduleReady) {
                sketchfabAPIUtilityCore.api.addEventListener(classScope.EVENT_MOUSE_ENTER, classScope.onNodeMouseEnter, { pick: 'slow' });
            } else {               
                sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, "a call to add a EVENT_MOUSE_ENTER event listener has been rejected because this NodesModule has not completed initialization");  
                return;
            }

        }

        if (event == classScope.EVENT_MOUSE_LEAVE) {

            if (classScope.moduleReady) {
                sketchfabAPIUtilityCore.api.addEventListener(classScope.EVENT_MOUSE_LEAVE, classScope.onNodeMouseLeave, { pick: 'slow' });
            } else {
                sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, "a call to add a EVENT_MOUSE_LEAVE event listener has been rejected because this NodesModule has not completed initialization");  
              
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
                if (event == classScope.EVENT_CLICK) {
                    sketchfabAPIUtilityCore.api.removeEventListener(classScope.EVENT_CLICK, classScope.onClick);
                }

                if (event == classScope.EVENT_MOUSE_ENTER) {
                    sketchfabAPIUtilityCore.api.removeEventListener(classScope.EVENT_MOUSE_ENTER, classScope.onNodeMouseEnter);
                }

                if (event == classScope.EVENT_MOUSE_LEAVE) {
                    sketchfabAPIUtilityCore.api.removeEventListener(classScope.EVENT_MOUSE_LEAVE, classScope.onNodeMouseLeave);
                }


            }
        }
    };

};

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function TransformNodes(sketchfabAPIUtilityCoreRef,nodesModuleRef, nodeObjectRef) {
    var classScope = this;
    var sketchfabAPIUtilityCore = sketchfabAPIUtilityCoreRef;
    var nodesModule = nodesModuleRef;
    var nodeObject = nodeObjectRef;   
    this.transformLocal;
    this.transformGlobal;
    this.axisOrientation = {};
    classScope.axisOrientation.world = "WORLD";
    classScope.axisOrientation.local = "LOCAL";

    try {
        classScope.transformLocal = new SketchfabAPIUTransformGeneric(nodeObject.localMatrix);
        classScope.transformGlobal = new SketchfabAPIUTransformGeneric(nodeObject.worldMatrix);
    } catch (err) {
       sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"constructor" function called using the TransformNodes object has failed , this module has a dependancy on the script SketchfabAPIUTransformGeneric, please iport it in your html file');
       
        return;
    };

   /* var sx = Math.hypot(classScope.transformGlobal.matrix[0], classScope.transformGlobal.matrix[1], classScope.transformGlobal.matrix[2]);
    var sy = Math.hypot(classScope.transformGlobal.matrix[4], classScope.transformGlobal.matrix[5], classScope.transformGlobal.matrix[6]);
    var sz = Math.hypot(classScope.transformGlobal.matrix[8], classScope.transformGlobal.matrix[9], classScope.transformGlobal.matrix[10]);
    console.log("global scale");
    console.log(sx + " --  " + sy + "  --  " + sz);
    var sx = Math.hypot(classScope.transformLocal.matrix[0], classScope.transformLocal.matrix[1], classScope.transformLocal.matrix[2]);
    var sy = Math.hypot(classScope.transformLocal.matrix[4], classScope.transformLocal.matrix[5], classScope.transformLocal.matrix[6]);
    var sz = Math.hypot(classScope.transformLocal.matrix[8], classScope.transformLocal.matrix[9], classScope.transformLocal.matrix[10]);
    console.log("local scale");
    console.log(sx + " --  " + sy + "  --  " + sz);*/

   

    this.vectors = {

        get vectorForward(){
            return classScope.transformLocal.vectorForward;
        },

        get vectorBackward() {
            return classScope.transformLocal.vectorBackward;
        },

        get vectorLeft() {
            return classScope.transformLocal.vectorLeft;
        },

        get vectorRight() {
            return classScope.transformLocal.vectorRight;
        },

        get vectorUp() {
            return classScope.transformLocal.vectorUp;
        },

        get vectorDown() {
            return classScope.transformLocal.vectorDown;
        }    
    
    };

    this.rotationAxis = {
        get X() {
            return classScope.transformLocal.rotationAxisX;
        },
        get Y() {
            return classScope.transformLocal.rotationAxisY;
        },
        get Z() {
            return classScope.transformLocal.rotationAxisZ;
        }
    }

    this.getRotation = function () {
        return classScope.transformLocal.getRotation();
    }

   
   

    //--------------------------------------------------------------------------------------------------------------------------

    this.setPositionX = function (singleAxisPosition, duration,axisOrientationRequired, easing, callback) {


       

        var nodeSingle;      

        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.warn("multiple nodes returned during call to setPosition, first node will be used");   
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }
       // console.log(classScope.transformLocal.extractScale());
        var v = [singleAxisPosition, 0, 0];
        var idm = classScope.transformLocal.getIdentityMatrix();
        idm[12] = singleAxisPosition;
       // classScope.transformLocal.translate(v);
         sketchfabAPIUtilityCore.api.setMatrix(nodeSingle.instanceID, classScope.transformLocal.matrix);
       // sketchfabAPIUtilityCore.api.translate(nodeSingle.instanceID, classScope.transformLocal.getPosition(), { "duration": duration, "easing": easing });

      /*  axisOrientationRequired = axisOrientationRequired || classScope.axisOrientation.local;
       
        if (axisOrientationRequired === classScope.axisOrientation.world) {
           
            classScope.transformGlobal.setPositionX(singleAxisPosition);
            var parentMatrixtransform = nodesModule.getfirstAncestorOfTypeMatrixTransform(nodeSingle);
            //  console.log(parentMatrixtransform);
            var sx = Math.hypot(parentMatrixtransform.transform.transformGlobal.matrix[0], parentMatrixtransform.transform.transformGlobal.matrix[1], parentMatrixtransform.transform.transformGlobal.matrix[2]);
            var sy = Math.hypot(parentMatrixtransform.transform.transformGlobal.matrix[4], parentMatrixtransform.transform.transformGlobal.matrix[5], parentMatrixtransform.transform.transformGlobal.matrix[6]);
            var sz = Math.hypot(parentMatrixtransform.transform.transformGlobal.matrix[8], parentMatrixtransform.transform.transformGlobal.matrix[9], parentMatrixtransform.transform.transformGlobal.matrix[10]);
           // console.log("global parent scale");
           // console.log(sx + " --  " + sy + "  --  " + sz);
            classScope.transformLocal.matrix = classScope.transformLocal.multiply(parentMatrixtransform.transform.transformGlobal.invert(), classScope.transformGlobal.matrix);
            classScope.transformLocal.scale([sx, sy, sz]);
        } else {
            classScope.transformLocal.setPositionX(singleAxisPosition);
        }

      //  console.log(classScope.transformLocal.matrix);
      // sketchfabAPIUtilityCore.api.setMatrix(nodeSingle.instanceID, classScope.transformLocal.matrix);
      sketchfabAPIUtilityCore.api.translate(nodeSingle.instanceID, classScope.transformLocal.getPosition(), { "duration": duration, "easing": easing });*/
        

    }


    //--------------------------------------------------------------------------------------------------------------------------

    this.setPositionY = function (singleAxisPosition, duration, easing, callback) {      

        var nodeSingle;      

        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.warn("multiple nodes returned during call to setPositionY, first node will be used");
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }

        classScope.transformLocal.setPositionY(singleAxisPosition);
        sketchfabAPIUtilityCore.api.translate(nodeSingle.instanceID, classScope.transformLocal.getPosition(), { "duration": duration, "easing": easing });
       

    }


    //--------------------------------------------------------------------------------------------------------------------------

    this.setPositionZ = function (singleAxisPosition, duration, easing, callback) {      

        var nodeSingle;       

        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.warn("multiple nodes returned during call to setPositionZ, first node will be used");
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }

        classScope.transformLocal.setPositionZ(singleAxisPosition);
        sketchfabAPIUtilityCore.api.translate(nodeSingle.instanceID, classScope.transformLocal.getPosition(), { "duration": duration, "easing": easing });
      
    }


    //--------------------------------------------------------------------------------------------------------------------------

    this.setPosition = function (position, duration, easing, callback) {
        if (duration === null || duration === undefined) {
            duration = 1;
        }
      
        var nodeSingle;       

        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.warn("multiple nodes returned during call to setPosition, first node will be used");
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }
        classScope.transformLocal.setPosition(position);
        sketchfabAPIUtilityCore.api.translate(nodeSingle.instanceID, position, { "duration": duration, "easing": easing });
      
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.getPosition = function (axisOrientationRequired) {
        axisOrientationRequired = axisOrientationRequired || classScope.axisOrientation.local;
        var transformToUse = classScope.transformLocal;
        if (axisOrientationRequired === classScope.axisOrientation.world) {             
            transformToUse = classScope.transformGlobal;
        }       

        return transformToUse.getPosition();
    };


    //--------------------------------------------------------------------------------------------------------------------------  

    this.translate = function (direction, distance, duration, easing, callback) {
      
        var nodeSingle;
        
        if (direction === null || direction === undefined) {
            direction = classScope.transformLocal.vectorForward;
        }
        if (distance === null || distance === undefined) {
            distance = 1;
        }
        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.warn("multiple nodes returned during call to translate, first node will be used");
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }

        var currentPosition = classScope.transformLocal.getPosition();
        var newPosition = [currentPosition[0] + (direction[0] * distance), currentPosition[1] + (direction[1] * distance), currentPosition[2] + (direction[2] * distance)];
        classScope.transformLocal.setPosition(newPosition);
        sketchfabAPIUtilityCore.api.translate(nodeSingle.instanceID, newPosition, { "duration": duration, "easing": easing }, callback);

        
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.rotateOnAxis = function (angle, axis) {

        var nodeSingle;

        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.warn("multiple nodes returned during call to rotateOnAxisX, first node will be used");
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }

        var out = classScope.transformLocal.rotateOnAxis(angle, axis);

        sketchfabAPIUtilityCore.api.setMatrix(nodeSingle.instanceID, out);

    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.reset = function () {
        var nodeSingle;

        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.warn("multiple nodes returned during call to reset, first node will be used");
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }
        sketchfabAPIUtilityCore.api.setMatrix(nodeSingle.instanceID, classScope.transformLocal.matrixCached);
        classScope.transformLocal.reset();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.lookat = function (direction, distance, duration, offset, callback) {
        var nodeSingle;

        if (Array.isArray(nodeObject)) {
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
             console.warn("multiple nodes returned during call to lookat, first node will be used");
            }
            nodeSingle = nodeObject[0];
        } else {
            nodeSingle = nodeObject;
        }
       
       
        if (direction === null || direction === undefined) {
            direction = [0, 0, 1];
        }
        if (distance === null || distance === undefined) {
            distance = 10;
        }
       


        var globalPos = classScope.getPosition(classScope.axisOrientation.world);

        var target = [];
        target[0] = globalPos[0];
        target[1] = globalPos[1];
        target[2] = globalPos[2];
        var eye = [target[0] + (direction[0] * distance), target[1] + (direction[1] * distance), target[2] + (direction[2] * distance)];
        if (offset !== null && offset !== undefined) {
            if (Array.isArray(offset)) {
                eye[0] += offset[0];
                eye[1] += offset[1];
                eye[2] += offset[2];
                target[0] += offset[0];
                target[1] += offset[1];
                target[2] += offset[2];
            }
        }
        sketchfabAPIUtilityCore.api.setCameraLookAt(eye, target, duration, callback);

       
    };
   
};