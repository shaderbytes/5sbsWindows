function SketchfabAPIUMaterialsModule() {

    //OBJECTS / STORAGE --------------------------------------------------------------------------------------------------------

    var classScope = this;   
    var sketchfabAPIUtilityCore;
    this.materialHash = {};
    this.materialsUIDPending = {};
    this.textureCache = {};
    this.textureLoadingCount = 0;
    var colorUtility;
    this.channelNames = {};
    //TYPED NAMES -------------------------------------------------------------------------------------------------------------- 

    //materialChannelProperties
    classScope.channelNames.AOPBR = "AOPBR";
    classScope.channelNames.AlbedoPBR = "AlbedoPBR";
    classScope.channelNames.BumpMap = "BumpMap";
    classScope.channelNames.CavityPBR = "CavityPBR";
    classScope.channelNames.DiffuseColor = "DiffuseColor";
    classScope.channelNames.DiffuseIntensity = "DiffuseIntensity";
    classScope.channelNames.DiffusePBR = "DiffusePBR";
    classScope.channelNames.EmitColor = "EmitColor";
    classScope.channelNames.GlossinessPBR = "GlossinessPBR";
    classScope.channelNames.MetalnessPBR = "MetalnessPBR";
    classScope.channelNames.NormalMap = "NormalMap";
    classScope.channelNames.Opacity = "Opacity";
    classScope.channelNames.RoughnessPBR = "RoughnessPBR";
    classScope.channelNames.SpecularColor = "SpecularColor";
    classScope.channelNames.SpecularF0 = "SpecularF0";
    classScope.channelNames.SpecularHardness = "SpecularHardness";
    classScope.channelNames.SpecularPBR = "SpecularPBR";
    classScope.channelNames.ClearCoat = "ClearCoat";
    classScope.channelNames.ClearCoatNormalMap = "ClearCoatNormalMap";
    classScope.channelNames.ClearCoatRoughness = "ClearCoatRoughness";
    classScope.channelNames.Matcap = "Matcap";
    classScope.channelNames.SubsurfaceScattering = "SubsurfaceScattering";
    classScope.channelNames.SubsurfaceTranslucency = "SubsurfaceTranslucency";

     this.key = "materials";

    //events
    this.EVENT_TEXTURE_APPLIED = "event_texture_applied";     
   

    //BOOLEANS------------------------------------------------------------------------------------------------------------------

    this.moduleReady = false;
    this.materialsReady = false;
    this.sceneTexturesReady = false;

    //--------------------------------------------------------------------------------------------------------------------------  

      
    //IF you set this module reference before calling create on the Utility , there is no need to call this module create manually, 
    //the utility will do it for you. If you are adding this after the utility is created itself then you do need to call this manually.
    // it will additionally check whether the utility is ready itself.
    this.create = function (sketchfabAPIUtilityCoreRef) {
        sketchfabAPIUtilityCore = sketchfabAPIUtilityCoreRef;
        if (!sketchfabAPIUtilityCore.apiReady) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"create" function called using the MaterialsModule has failed , sketchfabAPIUtilityCore.apiReady is false');           
            return;
        }
        try {
            colorUtility = new SBColorUtility();
        } catch (err) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, '"create" function called using the MaterialsModule has failed , this module has a dependancy on the script SBColorUtility, please iport it in your html file');
           
            return;
        }
        
        sketchfabAPIUtilityCore.api.getMaterialList(generateMaterialHash);
        sketchfabAPIUtilityCore.api.getTextureList(getSceneTextures);
    }

    //--------------------------------------------------------------------------------------------------------------------------   
    // use var here so the function is not exposed to users being able to reference it and call it outside of this object scope.
    var generateMaterialHash = function (err, materials) {
        if (err) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, 'Error when calling getMaterialList '+err);            
            return;
        }
        if (sketchfabAPIUtilityCore.enableDebugLogging) {
            console.log("materials listing");

        }
        for (var i = 0; i < materials.length; i++) {

            classScope.materialHash[materials[i].name] = materials[i];
            if (sketchfabAPIUtilityCore.enableDebugLogging) {
                console.log("name: " + materials[i].name);
            }
        }
        classScope.materialsReady = true;
        classScope.validatelocalSetupProcess();
    };


    //--------------------------------------------------------------------------------------------------------------------------

    var getSceneTextures = function (err, textures) {
        if (err) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, 'Error when calling getSceneTextures '+err);
          
            return;
        }
        if (sketchfabAPIUtilityCore.enableDebugLogging) {
            console.log("textures listing");
            console.log(textures);
        }
        for (var i = 0; i < textures.length; i++) {
            var UIDKey = textures[i].name.split(".")[0];
            classScope.textureCache[UIDKey] = textures[i].uid;
        }

        classScope.sceneTexturesReady = true;
        classScope.validatelocalSetupProcess();

    };

    //-------------------------------------------------------------------------------------------------------------------------- 

    this.validatelocalSetupProcess = function () {
   
        if (classScope.sceneTexturesReady && classScope.materialsReady) {
            classScope.moduleReady = true;
            sketchfabAPIUtilityCore.validateModulesReady();
        }
    };

   

    //--------------------------------------------------------------------------------------------------------------------------

    this.getObject = function (materialName, channelName) {
        if (!classScope.moduleReady) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, 'Error when calling getObject , moduleReady is false');          
            return;
        }

        var materialObject = classScope.materialHash[materialName];
        if (materialObject === null || materialObject === undefined) {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, 'Error when calling getObject , using material name ' + materialName + ' using the MaterialsModule has failed , no such material found');
           
           
        }

        var channelObject;
        if (materialObject !== null && materialObject !== undefined) {
            if (channelName !== null && channelName !== undefined && channelName !== "") {
                channelObject = materialObject.channels[channelName];
                if (channelObject === null || channelObject === undefined) {
                    sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, 'Error when calling getObject , using materialName ' + materialName + ' and channelName name ' + channelName + ' using the MaterialsModule has failed , no such channel found');
                   

                }
            }
        }
        
           
        //if no channelName is passed then the returned object will only have a valid property for materialObject , channelObject will be null.
        return { "materialObject": materialObject, "channelObject": channelObject };
    };


    //--------------------------------------------------------------------------------------------------------------------------

    this.setColor = function (materialName, channelName, channelPropertyName, hex) {
        channelPropertyName = channelPropertyName || "color";
        var propertyCacheKey = channelPropertyName + "cached";
        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {
            // if hex is null set it to a default white.
            hex = hex || "#FFFFFF";
            hex = colorUtility.expandHexShortToFull(hex);

            //if no color object exists , create one
            if (channelObject[channelPropertyName] === null || channelObject[channelPropertyName] === undefined) {
                channelObject[channelPropertyName] = [1, 1, 1];
            }

            //since texture and color cannot exist at the same time in the sketchfab API
            //test for texture and remove if needed.
            if (channelObject.texture) {
                channelObject.texture = null;
                delete channelObject.texture;
            }

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            //cache any existing color
            if (channelObject[propertyCacheKey] === undefined || channelObject[propertyCacheKey] === null) {
                channelObject[propertyCacheKey] = [];
                channelObject[propertyCacheKey][0] = channelObject[channelPropertyName][0];
                channelObject[propertyCacheKey][1] = channelObject[channelPropertyName][1];
                channelObject[propertyCacheKey][2] = channelObject[channelPropertyName][2];

            }

            channelObject[channelPropertyName][0] = colorUtility.srgbToLinear(parseInt(result[1], 16) / 255);
            channelObject[channelPropertyName][1] = colorUtility.srgbToLinear(parseInt(result[2], 16) / 255);
            channelObject[channelPropertyName][2] = colorUtility.srgbToLinear(parseInt(result[3], 16) / 255);
            sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);

        }
      
    };


    //--------------------------------------------------------------------------------------------------------------------------

    this.resetColor = function (materialName, channelName, channelPropertyName) {
        channelPropertyName = channelPropertyName || "color";
        var propertyCacheKey = channelPropertyName + "cached";
        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {

            if (channelObject[propertyCacheKey] !== undefined && channelObject[propertyCacheKey] !== null) {
                channelObject[channelPropertyName][0] = channelObject[propertyCacheKey][0];
                channelObject[channelPropertyName][1] = channelObject[propertyCacheKey][1];
                channelObject[channelPropertyName][2] = channelObject[propertyCacheKey][2];
                sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);
                return;
            } else {
                if (sketchfabAPIUtilityCore.enableDebugLogging) {
                    console.log("a call to reset a color has been ignored since the color has not changed");
                }
                return;
            }

        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.logChannelPropertiesAndValues = function (materialName, channelName) {

        console.log("----------------");
        console.log("Channel " + channelName);
        console.log("----------------");

        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {
            classScope.logPropertiesAndValuesRecursive("", "", channelObject);
        }
    }

    //--------------------------------------------------------------------------------------------------------------------------

    this.logPropertiesAndValuesRecursive = function (s, space, ob) {
        for (prop in ob) {
            if (ob[prop] === Object(ob[prop])) {
                console.log(prop + " : ");
                var previousSpace = space;
                space += "      ";
                classScope.logPropertiesAndValuesRecursive(s, space, ob[prop]);
                space = previousSpace;

            } else {
                console.log(space + prop + " : " + ob[prop]);
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------   

    this.setFactor = function (materialName, channelName, factor) {
        //if factor is null set it to a default of 1;
        factor = factor || 1;
     
        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {

            if (channelObject.factorIsCached === null || channelObject.factorIsCached === undefined) {
                channelObject.factorIsCached = true;
                channelObject.factorCached = channelObject.factor;
            }
            channelObject.factor = factor;
            sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);

        }
       
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.resetFactor = function (materialName, channelName) {

        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {

            if (channelObject.factorIsCached !== undefined) {
                channelObject.factor = channelObject.factorCached;
                sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);
                return;
            } else {
                if (sketchfabAPIUtilityCore.enableDebugLogging) {
                    console.log("a call to reset factor has been ignored since the factor has not changed");
                }
                return;
            }
        }       
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setOpacity = function (materialName, factor) {
        classScope.setFactor(materialName, classScope.channelNames.Opacity, factor);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.resetOpacity = function (materialName) {
        classScope.resetFactor(materialName, classScope.channelNames.Opacity);

    };

    //--------------------------------------------------------------------------------------------------------------------------   

    this.setChannelProperties = function (materialName, channelName, channelObjectDefaults, applyImmediate) {

        //if applyImmediate is null set it to a default of true
        applyImmediate = applyImmediate || true;
        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {
            for (var prop in channelObjectDefaults) {
                channelObject[prop] = channelObjectDefaults[prop];
            }
            if (applyImmediate) {
                sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);
            }
        }

    };


    this.setTextureProperties = function (materialName, channelName, textureObjectDefaults, applyImmediate) {
        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {
            for (var prop in textureObjectDefaults) {
                channelObject.texture[prop] = textureObjectDefaults[prop];
            }
            if (applyImmediate) {
                sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);
            }
        }
       
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.resetMaterialUID = function (materialName, channelName) {
       
        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {

            if (channelObject.textureIsCached !== undefined && channelObject.textureIsCached !== null) {
                channelObject.texture = channelObject.textureCached;
                sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);
            }
        }
        
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setMaterialUIDPending = function (materialName, channelName, UIDKey, textureObjectDefaults, channelObjectDefaults) {

        if (UIDKey === null || UIDKey === undefined || UIDKey === "") {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR, 'a call to "setMaterialUIDPending" has failed. The argument UIDKey must have a valid string value so this can be used to look up the UID at a later point');           
            return;
        }

        var ob = {};
        ob.materialName = materialName;
        ob.channelName = channelName;
        ob.textureObjectDefaults = textureObjectDefaults;
        ob.channelObjectDefaults = channelObjectDefaults;

        var storage = classScope.materialsUIDPending[UIDKey];
        if (storage === null || storage === undefined) {
            storage = classScope.materialsUIDPending[UIDKey] = [];
        }

        storage.push(ob);

    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.applyMaterialUIDPending = function (UIDKey) {

        if (UIDKey !== null && UIDKey !== undefined && UIDKey !== "") {




            var storage = classScope.materialsUIDPending[UIDKey];
            var uid = classScope.textureCache[UIDKey];
            if (storage !== null && storage !== undefined) {
                for (var i = 0; i < storage.length; i++) {
                    var ob = storage[i];
                    var materialName = ob.materialName;
                    var channelName = ob.channelName;
                    var textureObjectDefaults = ob.textureObjectDefaults;
                    var channelObjectDefaults = ob.channelObjectDefaults;
                    var objectReferences = classScope.getObject(materialName, channelName);
                    var channelObject = objectReferences.channelObject;
                    if (channelObject !== null && channelObject !== undefined) {

                        //remove texture
                        if (uid === "") {

                            //add color if it does not exist
                            if (channelObject.color === null || channelObject.color === undefined) {
                                classScope.setColor(materialName, channelName, null, "#ffffff");
                            }


                            channelObject.texture = null;
                            delete channelObject.texture;
                            sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);

                        } else {

                            //remove color if it exists
                            if (channelObject.color) {
                                channelObject.color = null;
                                delete channelObject.color;
                            }


                            //this is the cache of the original texture
                            if (channelObject.textureIsCached === undefined || channelObject.textureIsCached === null) {
                                channelObject.textureIsCached = true;
                                channelObject.textureCached = channelObject.texture;
                            }

                            //this is to add channel object defaults
                            if (channelObjectDefaults !== null && channelObjectDefaults !== undefined) {
                                classScope.setChannelProperties(materialName,channelName, channelObjectDefaults,false);
                            }

                            //this to help set up a better default texture object when one is created
                            //basically it just sets the internal format to the best possible default option
                            // after this object is created , any texture defaults passed into this function will still have the final say and can overwrite this property if needed


                            var bestDefaultInternalFormat = "";
                            switch (channelName) {

                                case classScope.channelNames.AOPBR:
                                case classScope.channelNames.BumpMap:
                                case classScope.channelNames.CavityPBR:
                                case classScope.channelNames.GlossinessPBR:
                                case classScope.channelNames.MetalnessPBR:
                                case classScope.channelNames.SpecularF0:
                                case classScope.channelNames.SpecularPBR:
                                case classScope.channelNames.ClearCoatRoughness:
                                    bestDefaultInternalFormat = "LUMINANCE";
                                    break;

                                case classScope.channelNames.Opacity:
                                    bestDefaultInternalFormat = "ALPHA";
                                    break;
                                default:
                                    bestDefaultInternalFormat = "RGB";
                                    break;

                            }

                            //if no texture property exists , create one , if it does exist, copy it
                            var texob = {};
                            var prop = null;
                            if (channelObject.textureCached === null || channelObject.textureCached === undefined) {
                                texob = {};
                                texob.internalFormat = bestDefaultInternalFormat;
                                texob.magFilter = "LINEAR";
                                texob.minFilter = "LINEAR_MIPMAP_LINEAR";
                                texob.texCoordUnit = 0;
                                texob.textureTarget = "TEXTURE_2D";
                                texob.uid = 0; // not actual value , the uid still needs to be returned from a succcessful texture upload.
                                texob.wrapS = "REPEAT";
                                texob.wrapT = "REPEAT";

                            } else {
                                //deep copy
                                for (prop in channelObject.textureCached) {
                                    texob[prop] = channelObject.textureCached[prop];
                                }
                            }


                            channelObject.texture = texob;

                            //this is to add texture object defaults
                            if (textureObjectDefaults !== null && textureObjectDefaults !== null) {
                                classScope.setTextureProperties(materialName,channelName, textureObjectDefaults, false);
                            }

                            channelObject.texture.uid = uid;
                            sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);
                        }
                    }
                    
                }////////////////////////////////////////////////////////

                classScope.materialsUIDPending[UIDKey] = null;
                storage = null;
                delete classScope.materialsUIDPending[UIDKey];
                classScope.textureLoadingCount--;
                sketchfabAPIUtilityCore.dispatchEvent(classScope.EVENT_TEXTURE_APPLIED, { "UIDKey": UIDKey, textureLoadingCount: classScope.textureLoadingCount });
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.removeTextureFromMaterialChannel = function (materialName, channelName) {

        
        var objectReferences = classScope.getObject(materialName, channelName);
        var channelObject = objectReferences.channelObject;
        if (channelObject !== null && channelObject !== undefined) {
            //add color if it does not exist
            if (channelObject.color === null || channelObject.color === undefined) {
                classScope.setColor(materialName, channelName, null, "#ffffff");
            }
            channelObject.texture = null;
            delete channelObject.texture;           
            sketchfabAPIUtilityCore.api.setMaterial(objectReferences.materialObject);
            classScope.resetFactor(materialName, channelName);

        }
       
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.addTexture = function (url, UIDKey, useCashing) {
      
        useCashing = useCashing || false;
        if (UIDKey === null || UIDKey === undefined || UIDKey === "") {
            sketchfabAPIUtilityCore.throwError(sketchfabAPIUtilityCore.EVENT_ERROR,'a call to "addTexture" has failed. The argument UIDKey must have a valid string value so this texture has a means to be looked up at a later point');            
            return;
        }
        classScope.textureLoadingCount++;
        if (useCashing) {            
            if (classScope.textureCache[UIDKey] !== null && classScope.textureCache[UIDKey] !== undefined) {              
                if (sketchfabAPIUtilityCore.enableDebugLogging) {                   
                    console.log('a call to addTexture found an existing textureCache for UIDKey "' + UIDKey + '", applyMaterialUIDPending called immediately.');
                }
                classScope.applyMaterialUIDPending(UIDKey);
                return;
            }
        }
        function addTextureCallback(err, uid) {            
            classScope.textureCache[UIDKey] = uid;
            classScope.applyMaterialUIDPending(UIDKey);
           
        }

        // validate if the uid exists and if so rather use update texture , otherwise use addTexture
        if (classScope.textureCache[UIDKey] !== null && classScope.textureCache[UIDKey] !== undefined) {
            sketchfabAPIUtilityCore.api.updateTexture(url, classScope.textureCache[UIDKey], addTextureCallback);
        } else {
            sketchfabAPIUtilityCore.api.addTexture(url, addTextureCallback);
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.resetTexture = function (materialName, channelName) {

        classScope.resetMaterialUID(materialName, channelName);

    };


    //--------------------------------------------------------------------------------------------------------------------------

    this.addEventListener = function (event, func) {
        if (sketchfabAPIUtilityCore.eventListeners[event] === null || sketchfabAPIUtilityCore.eventListeners[event] === undefined) {
            sketchfabAPIUtilityCore.eventListeners[event] = [];            

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

            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------






};