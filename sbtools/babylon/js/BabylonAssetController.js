function BabylonAssetController(sceneControllerRef){

	this.sceneController = sceneControllerRef;
	this.data = {};
	this.loadQueue = [];
	
	this.collectionAssets = {};
	this.collectionAssetGroups = {};
	this.collectionAssetVariantGroups = {};

	this.collectionAssetsPendingActions = [];
	this.collectionMaterials = {};
	this.collectionMaterialsPendingActions = [];
	this.assetVisibilityFilters = {};
	this.assetTransformFilters = {};
	
	this.rootTransformNode;

	this.setAssetRotation = function(state,data){				
		
		var a = this.collectionAssets[data.assetTargetKey];		
		var rv;
		if(state){
			ra = data.rotation_open.split(",");			
		}else{
			ra = data.rotation_closed.split(",");
		}
		rv = new BABYLON.Vector3(parseFloat(ra[0]),parseFloat(ra[1]),parseFloat(ra[2]));
		a.node.rotation = rv;
		
	};

	this.setAssetVisibilityFilter = function(filter){
		//console.log("setAssetVisibilityFilter filter "+filter);
		this.assetVisibilityFilters[filter] = true;
		
	};

	this.removeAssetVisibilityFilter= function(filter){
		//console.log("removeAssetVisibilityFilter filter "+filter);
		this.assetVisibilityFilters[filter] = false;
		
	};
	this.setAssetTransformFilter = function(filter){
		//console.log("setAssetVisibilityFilter filter "+filter);
		this.assetTransformFilters[filter] = true;
		
	};

	this.removeAssetTransformFilter= function(filter){
		//console.log("removeAssetVisibilityFilter filter "+filter);
		this.assetTransformFilters[filter] = false;
		
	};
	this.invalidateAssetTransformFilters = function(){


		//console.log("invalidateAssetsForVisibilityFilters");
		for(var prop in this.collectionAssets){
			var a = this.collectionAssets[prop];
			var filterFound = false;
			

			for(var prop2 in a.collectionTransforms){
				
				if(this.assetTransformFilters[prop2] === true){
					
					
					if(a.node){
						a.requiresTransformReset = true;
						var t = a.collectionTransforms[prop2];

						if(t.location !== null && t.location !== undefined){
							a.node.position = (t.location);
							
						}

						if(t.rotation !== null && t.rotation !== undefined){							
							a.node.rotation = t.rotation;
							
						}
						if(t.scaling !== null && t.scaling !== undefined){
							a.node.scaling = t.scaling;
							
						}
						if(t.scalingNegateX !== null && t.scalingNegateX !== undefined  && t.scalingNegateX === true){
							a.node.scaling.x *= -1;
							
						}

						filterFound = true;
						break;

					}
				}
			}
			if(!filterFound){
				if(a.node){
					if(a.requiresTransformReset){
						a.requiresTransformReset = false;
						//set to default transform 
						var t = a.collectionTransforms.DEFAULT;
						if(t.location !== null && t.location !== undefined){
							a.node.position = (t.location);
						
						}
						if(t.rotation !== null && t.rotation !== undefined){
							a.node.rotation = t.rotation;
						}
						if(t.scaling !== null && t.scaling !== undefined){
							a.node.scaling = t.scaling;
						}
					}					
				}
			}
		}	

	
	
	};
	
	this.invalidateAssetsForVisibilityFilters = function(){
		//console.log("invalidateAssetsForVisibilityFilters");


		for(var prop in this.collectionAssets){
			var a = this.collectionAssets[prop];
			var filterFound = false;
			//console.log(a.key);
			//console.log(a.visibilityFilterTargets);


			for(var j=0;j<a.visibilityFilterTargets.length;j++){
				if(this.assetVisibilityFilters[a.visibilityFilterTargets[j]] === true){
					//console.log("item "+a.key+"  is filtered via "+a.visibilityFilterTargets[j]);
					//console.log(a);
					//console.log("a filter does not change the actual enabled state , that must remain as is for when it gets unfitered to go back to where it was");
					if(a.node){
						if(a.enabled){
						//console.log("has node and is enabled so now gets filtered!");
							a.node.setEnabled(false);
						}
						filterFound = true;
						break;

					}
				}
			}
			if(!filterFound){
				if(a.node){
					if(a.enabled){
						a.node.setEnabled(true);
					}
				}
			}
		}	

		
	
	};

	this.invalidateAssetVariants=  function(){	
		//console.log("invalidateAssetVariants");
		for(var prop in this.collectionAssetVariantGroups){
			var group = this.collectionAssetVariantGroups[prop];
			if(!group.enabled) continue;
			for(var prop2 in group){
				//console.log("prop2 "+prop2);
				var f = this.assetVisibilityFilters[prop2];
				if(f !== null && f !== undefined){
					var a = group[prop2];
					//console.log("about to call setEnabled key::"+a.key+" val::"+f);

					if(Array.isArray(a)){
						this.setGroupEnabled(a.key,f);
					}else{
						this.setEnabled(a.key,f);
					}

					
				}
			}
		
		}
	
	}

	this.invalidateAllProcessRequests = function(){
		//console.log("invalidateAllProcessRequests");
		var newpa = [];		
		for(var i=0;i<this.collectionAssetsPendingActions.length;i++){
			var pa = this.collectionAssetsPendingActions[i];			
			 pa.used = this[pa.function].apply(this,pa.arguments);
			 if(!pa.used){
				 newpa.push(pa);
			 }
		}		
		//adjust  pending actions
		this.collectionAssetsPendingActions = newpa;


		
		//console.log("-------------");
		var newpa = [];
		for(var i=0;i<this.collectionMaterialsPendingActions.length;i++){
			var pa = this.collectionMaterialsPendingActions[i];
			  pa.used = this[pa.function].apply(this,pa.arguments);
			 if(!pa.used){
				 newpa.push(pa);
			 }
		}
		//adjust  pending actions
		this.collectionMaterialsPendingActions = newpa;	

		this.invalidateAssetTransformFilters();
		this.invalidateAssetVariants();
	    this.invalidateAssetsForVisibilityFilters();
		
	
	};	

	this.Asset = function(assetControllerRef){
	    this.assetController = assetControllerRef;
		this.key;
		this.loaded = false;
		this.loading = false;
		this.url;
		this.parent;
		this.node;
		this.enabled = true;
		this.collectionTransforms = {};				
		this.visibilityFilterTargets = [];
		this.requiresTransformReset = false;
		
		

	};

	this.Asset.prototype = {
		loadProgress:function(event){
			//console.log("loadProgress");
			//console.log(event);

			//clear if null or undefined
		   if(event === null || event === undefined){
				this.assetController.sceneController.application.updateLoadProgress("");
				return;
			}
			if(!event.lengthComputable){
				this.assetController.sceneController.application.updateLoadProgress(this.key+"<br>LOADING");
				return;
			}

			var val = this.key+"<br>LOADING " + (((event.loaded/event.total)*100)|0)+"%";
			this.assetController.sceneController.application.updateLoadProgress(val);
			

			// this.assetController.sceneController.application.updateLoadProgress();
		},
		loadSuccess:function(event){
			this.assetController.sceneController.application.setLoadProgressDisplay(false);
			//console.log("++++++++++++++++++++LOAD SUCCCESS++++++++++++++++++++++++++++++++ "+this.key);
			//console.log(event);
			//console.log("-----------------");
			//console.log("-----------------");
			this.loaded = true;
			this.loading = false;


				//materials
			var m = this.assetController.sceneController.scene.materials;
			var ml = this.assetController.sceneController.scene.materials.length;
			/*console.log("-----------------");
			console.log("-----------------");
			console.log("scene.materials before dispose length   =  "+ml);
			for(var i=0;i< ml;i++){
				console.log("id:"+m[i].id+" uid:"+m[i].uniqueId);
			}
			console.log("-----------------");
			console.log("-----------------");
			console.log("collectionMaterials befor set up");			
			for(var prop in this.assetController.collectionMaterials){
				console.log("id:"+this.assetController.collectionMaterials[prop].id+" uid:"+this.assetController.collectionMaterials[prop].uniqueId);
			}
			console.log("-----------------");
			console.log("-----------------");
			console.log("**************invalidate collectionMaterials*************");*/
			//first invalidate the material looup
			for(var i=0;i< ml;i++){
				//console.log(m[i].name);
				if(this.assetController.collectionMaterials[m[i].name] === null || this.assetController.collectionMaterials[m[i].name] === undefined){
					//console.log((m[i].name)+" is a unsed key value in collectionMaterials , creating on now uniqueId = "+m[i].uniqueId)
					this.assetController.collectionMaterials[m[i].name] =  m[i];
					//change sorting for alpha textures
					if(m[i].albedoTexture){
						if(m[i].albedoTexture.hasAlpha){				
							m[i].transparencyMode = 1;
						}		
					}
				}else{
					//console.log((m[i].name)+" is a USED key value in collectionMaterials uniqueId "+this.assetController.collectionMaterials[m[i].name].uniqueId+"  , nothing created");
				}
			
			}

			/*console.log("-----------------");
			console.log("-----------------");
			console.log("collectionMaterials after set up");			
			for(var prop in this.assetController.collectionMaterials){
				console.log("id:"+this.assetController.collectionMaterials[prop].id+" uid:"+this.assetController.collectionMaterials[prop].uniqueId);
			}
			console.log("-----------------");
			console.log("-----------------");*/


			var disposableMaterials = [];
			this.handleDuplicateMaterials = function(nodesArray){			
			//console.log("*****************************************************************handleDuplicateMaterials called");			
				for(var i=0;i< nodesArray.length;i++){					
					var n = nodesArray[i];
					/*console.log(n.id+ " ------------------------------------------------------");
					console.log(n.material);*/					
					if(n.material){
						//console.log("material "+n.material.id+" uniqueId = "+n.material.uniqueId);
						var existingMaterial = this.assetController.collectionMaterials[n.material.id];
						if(existingMaterial !== null && existingMaterial !== undefined ){
							//console.log("existingMaterial "+n.material.id);
							if(n.material.uniqueId !== existingMaterial.uniqueId){
								/*console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
								console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
								console.log("materials not equal n.uniqueId = "+n.material.uniqueId+"  existingMaterial.uniqueId = "+existingMaterial.uniqueId);
								console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
								console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")*/
								disposableMaterials.push(n.material);
								n.material = null;								
								n.material = existingMaterial;
							}else{
								//console.log("materials ARE equal ");
							}
						}else{
						//console.log("no existing material found ")
						}
					}

					var nc = n.getChildren();
					if(nc !== null && nc !== undefined ){
						if(nc.length > 0){
							this.handleDuplicateMaterials(nc);
						}
					}
				};
				
			};
			
			this.handleDuplicateMaterials(event[0].getChildren());
			//console.log("*****************************************************************handleDuplicateMaterials finished");	
			for(var i=0;i< disposableMaterials.length;i++){
				//console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^about to despose material "+disposableMaterials[i].id);
				disposableMaterials[i].dispose(true,true);
			}
			disposableMaterials = [];

			var m = this.assetController.sceneController.scene.materials;
			var ml = this.assetController.sceneController.scene.materials.length;
			/*console.log("-----------------");
			console.log("-----------------");
			console.log("scene.materials after dispose length   =  "+ml);
			for(var i=0;i< ml;i++){
				console.log("id:"+m[i].id+" uid:"+m[i].uniqueId);
			}
			console.log("-----------------");
			console.log("-----------------");*/
			

			var parentRef = event[0];
			var childNode;
			var nestInTransform = false;
			var transformNode;

			this.handleChildren = function(childrenArray,parentNode){
				//console.log("handleChildren length "+childrenArray.length);
				//console.log(childrenArray);
				if(childrenArray === null || childrenArray === undefined) return;

				if(childrenArray[0].name.indexOf("primitive") !== -1){
					//crude .. need to redo 
					//console.log("has primitive in name skip and continue");
					return;
					
				}

				

				

				for(var i=0;i< childrenArray.length;i++){					
					if(!(childrenArray[i] instanceof BABYLON.TransformNode)){
					//console.log("not instanceof BABYLON.TransformNode skip and continue");
					continue;
					
					}
					
					childNode = childrenArray[i];
					//console.log("childNode");
					//console.log(childNode);
					childNode.setParent(null);
					childNode.rotation = new BABYLON.Vector3(0,0,0);
					childNode.scaling = new BABYLON.Vector3(1,1,1);
					var p = childNode.position;
					p.x *= -1;
					childNode.position = p;

					if(nestInTransform){
						childNode.parent =  parentNode;
						//at this point the children might have an asset defined from data or not so check and use if present or create
						var cn = this.assetController.collectionAssets[childNode.name];
						if(cn === null || cn === undefined){
							cn = new this.assetController.Asset(this.assetController);
							cn.key = childNode.name;						
							this.assetController.collectionAssets[cn.key] = cn;
							cn.collectionTransforms.DEFAULT = new this.assetController.Transform();
							cn.collectionTransforms.DEFAULT.location = new BABYLON.Vector3();
							cn.collectionTransforms.DEFAULT.location.x = childNode.position.x;
							cn.collectionTransforms.DEFAULT.location.y = childNode.position.y;
							cn.collectionTransforms.DEFAULT.location.z = childNode.position.z;

							cn.collectionTransforms.DEFAULT.rotation  = new BABYLON.Vector3();
							cn.collectionTransforms.DEFAULT.rotation.x = childNode.rotation.x;
							cn.collectionTransforms.DEFAULT.rotation.y = childNode.rotation.y;
							cn.collectionTransforms.DEFAULT.rotation.z = childNode.rotation.z;						

							cn.collectionTransforms.DEFAULT.scaling  = new BABYLON.Vector3();
							cn.collectionTransforms.DEFAULT.scaling.x = childNode.scaling.x;
							cn.collectionTransforms.DEFAULT.scaling.y = childNode.scaling.y;
							cn.collectionTransforms.DEFAULT.scaling.z = childNode.scaling.z;
								
						}						
							
						cn.loaded = true;
						cn.node = childNode;
							
							

					}


					var nc = childNode.getChildren();
					if(nc !== null && nc !== undefined ){
						if(nc.length > 0){
							this.handleChildren(nc,childNode);
						}
					}



				}

				this.assetController.sceneController.scene.removeMesh(parentRef);
			
			
			}

			var pc = parentRef.getChildren();
			if(pc.length > 1){
				//console.log("create nesting transform "+this.key);					
				transformNode  = new BABYLON.TransformNode(this.key); 					
				nestInTransform = true;
			}
			this.handleChildren(pc,transformNode);

		/*
			if(parentRef !== null && parentRef !== undefined){
				//ok we found a parent __root__
				//console.log("handling parent ref");
				var c = parentRef.getChildren();
				//if multiple children then create a transformNode to nest them in
				//console.log("children");
				//console.log(c);
			
				if(c.length > 1){
				    console.log("create nesting transform "+this.key);
					console.log(c);
					transformNode  = new BABYLON.TransformNode(this.key); 					
					nestInTransform = true;
				}
				for(var i=0;i< c.length;i++){
						childNode = c[i];
						childNode.setParent(null);
						childNode.rotation = new BABYLON.Vector3(0,0,0);
						childNode.scaling = new BABYLON.Vector3(1,1,1);
						var p = childNode.position;
						p.x *= -1;
						childNode.position = p;
						if(nestInTransform){
							childNode.parent =  transformNode;
							//at this point the children might have an asset defined from data or not so check and use if present or create
							var cn = this.assetController.collectionAssets[childNode.name];
							if(cn === null || cn === undefined){
								cn = new this.assetController.Asset(this.assetController);
								cn.key = childNode.name;						
								this.assetController.collectionAssets[cn.key] = cn;
								cn.collectionTransforms.DEFAULT = new this.assetController.Transform();
								cn.collectionTransforms.DEFAULT.location = new BABYLON.Vector3();
								cn.collectionTransforms.DEFAULT.location.x = childNode.position.x;
								cn.collectionTransforms.DEFAULT.location.y = childNode.position.y;
								cn.collectionTransforms.DEFAULT.location.z = childNode.position.z;

								cn.collectionTransforms.DEFAULT.rotation  = new BABYLON.Vector3();
								cn.collectionTransforms.DEFAULT.rotation.x = childNode.rotation.x;
								cn.collectionTransforms.DEFAULT.rotation.y = childNode.rotation.y;
								cn.collectionTransforms.DEFAULT.rotation.z = childNode.rotation.z;						

								cn.collectionTransforms.DEFAULT.scaling  = new BABYLON.Vector3();
								cn.collectionTransforms.DEFAULT.scaling.x = childNode.scaling.x;
								cn.collectionTransforms.DEFAULT.scaling.y = childNode.scaling.y;
								cn.collectionTransforms.DEFAULT.scaling.z = childNode.scaling.z;
								
							}
							
							
							cn.loaded = true;
							cn.node = childNode;
							
							

						}
				
				}
				this.assetController.sceneController.scene.removeMesh(parentRef);
			}*/
			//console.log("nestInTransform "+nestInTransform);
			if(nestInTransform){
				this.node = transformNode;
			}else{
				this.node =childNode;
			}				

			//set transform to default
			if(this.collectionTransforms.DEFAULT.location !== null && this.collectionTransforms.DEFAULT.location !== undefined){
				this.node.position = this.collectionTransforms.DEFAULT.location;
				
			}

			if(this.collectionTransforms.DEFAULT.rotation !== null && this.collectionTransforms.DEFAULT.rotation !== undefined){
				this.node.rotation = this.collectionTransforms.DEFAULT.rotation;
				
			}

			if(this.collectionTransforms.DEFAULT.scaling !== null && this.collectionTransforms.DEFAULT.scaling !== undefined){
				this.node.scaling = this.collectionTransforms.DEFAULT.scaling;
				
			}
			this.node.parent = this.assetController.rootTransformNode;

			this.assetController.invalidateParenting(this);		
			this.assetController.invalidateAllProcessRequests();		

			},
			
			loadError:function(){			
				console.log("!!LOAD ERROR!!");
				console.log(arguments);
			},
			processLoading:function(){
			if(!this.loaded){
				if(!this.loading){
					this.loading = true;					
					this.assetController.sceneController.application.setLoadProgressDisplay(true);
					BABYLON.SceneLoader.ImportMesh("","",this.url,  this.assetController.sceneController.scene, this.loadSuccess.bind(this) , this.loadProgress.bind(this) , this.loadError.bind(this));   
				}
			}		
		}	
	
	};

	this.Transform = function(){
		this.location = undefined;
		this.rotation = undefined
		this.scaling = undefined;
		this.scalingNegateX = undefined;
	};

	this.PendingAction = function(){
		this.function = "";
		this.arguments = [];
		this.used = false;
	};

	this.getAsset = function(assetKey){
		//no handling child nodes .. TODO store child nodes when building?? or recursive loop here to get child node
		return this.collectionAssets[assetKey];
	};


	this.invalidateParenting =  function(assetRef,isPendingAction){
		//console.log("invalidateParenting key "+assetRef.key);
		//console.log(assetRef);
		var used = false;
		var requiresPendingAction = false;
		if(assetRef.parent !== null && assetRef.parent !== undefined){	
				
			var parentAsset = assetRef.assetController.collectionAssets[assetRef.parent];
			if(parentAsset !== null && parentAsset !== undefined){	
				//console.log("found parent asset");
				if(parentAsset.node !== null && parentAsset.node !== undefined){	
					//console.log("found parent asset node");				
					assetRef.node.parent = parentAsset.node;
					
					used = true;
				}else{
					requiresPendingAction = true;	
				}		
			}else{
				requiresPendingAction = true;					
			}	
			
			if(isPendingAction === null || isPendingAction === undefined){
				if(requiresPendingAction){
					//console.log("pending action created for invalidateParenting ");
					var pa = new this.PendingAction();
					pa.function = "invalidateParenting";
					pa.arguments = [];
					for(var i=0;i<arguments.length;i++){
						pa.arguments.push(arguments[i]);
					}
					pa.arguments[1] = true;			
					this.collectionAssetsPendingActions.push(pa);	
				}
			}
		}	
		return used;
			
	};
	this.setGroupEnabled = function(assetKey,enabledState){
		//console.log("setGroupEnabled "+assetKey+" enabledState "+enabledState);
		var group = this.collectionAssetGroups[assetKey];
		if(group !== null && group !== undefined){
			for(var i=0;i<group.length;i++){
				this.setEnabled(group[i].key,enabledState);
			}
		}	
	};


	this.setEnabled = function(assetKey,enabledState,isPendingAction){
		//console.log("setEnabled "+assetKey+" enabledState "+enabledState);
		var used = false;
		var createPendingAction = false;
		var loadRequired = false;
		var asset = this.collectionAssets[assetKey];
		if(asset !== null && asset !== undefined){
			//asset found
			//console.log("asset found");
			if(asset.loaded){
				//console.log("asset loaded");
				//asset loaded so run the function
				if(asset.enabled !== enabledState){
					asset.enabled = enabledState;				
					asset.node.setEnabled(asset.enabled);
				}
				used = true;

			}else{
				//asset exist but not loaded, could be never started loading or busy loading
				
				if(!asset.loading){
					
					
					if(asset.url !== null && asset.url !== undefined){
						if(enabledState === false){
							
							return true;
						}
						//console.log("load asset");
						asset.processLoading();
					}else{
						
						//no asset found sent up a pending action , but only if this is not a pending action call already , we dont want duplicates
						if(isPendingAction === null || isPendingAction === undefined){
							var pa = new this.PendingAction();
							pa.function = "setEnabled";
							pa.arguments = [];
							for(var i=0;i<arguments.length;i++){
								pa.arguments.push(arguments[i]);
							}
							pa.arguments[2] = true;			
							this.collectionAssetsPendingActions.push(pa);	
						}	

					}
				};	
			}
		}else{
			//no asset found sent up a pending action , but only if this is not a pending action call already , we dont want duplicates
			if(isPendingAction === null || isPendingAction === undefined){
				var pa = new this.PendingAction();
				pa.function = "setEnabled";
				pa.arguments = [];
				for(var i=0;i<arguments.length;i++){
					pa.arguments.push(arguments[i]);
				}
				pa.arguments[2] = true;			
				this.collectionAssetsPendingActions.push(pa);	
			}	
		}	
		
		return used;
	};

	this.processVariantEnabled = function(data,enabledState){

		   var group = this.collectionAssetVariantGroups[data.variantGroup];		  
		   for(var prop in group){
			
				var f = this.assetVisibilityFilters[prop];
				   if(f === null || f === undefined){
						continue;
				   }else{
					   if(f === true){
							//filter found and active
							group.enabled = enabledState;
							var a = group[prop];
							
							if(Array.isArray(a)){
								this.setGroupEnabled(a.key,enabledState);
							}else{
								this.setEnabled(a.key,enabledState);
							}
							
							break;	   
					   }		   
				   }
		   
		   }

		   this.invalidateAssetsForVisibilityFilters();


	};

	this.setVariantEnabled = function(event){
	
		var enabledState = event.UIItemTarget.isSelected;
		if(Array.isArray(event.data)){
			for(var i=0;i<event.data.length;i++){
				var v = event.data[i];
				if(v.requestedState !== null && v.requestedState !== undefined){
				   enabledState = v.requestedState;
				}
				this.processVariantEnabled(v,enabledState);
			}
		}else{

			var v = event.data;
			if(v.requestedState !== null && v.requestedState !== undefined){
				enabledState = v.requestedState;
			}
			this.processVariantEnabled(v,enabledState);
	 
		}


	
	};

	this.setTexture = function(assetKey,channel,url,isPendingAction){
	
		var asset = this.collectionMaterials[assetKey];
		var used = false;
		if(asset !== null && asset !== undefined){	
			
			asset[channel] = new BABYLON.Texture(url, this.sceneController.scene);
			asset[channel].vScale = -1;
			//failsafe to remove albedo color // probaby need a better solution as you might in fact want this to reamin , for bumped plane colored surfaces
			//asset.albedoColor = BABYLON.Color3.White();
			used =  true;
		}else{
			
			if(isPendingAction === null || isPendingAction === undefined){
				var pa = new this.PendingAction();
				pa.function = "setTexture";
				pa.arguments = [];
				for(var i=0;i<arguments.length;i++){
					pa.arguments.push(arguments[i]);
				}
				pa.arguments[3] = true;
				
				this.collectionMaterialsPendingActions.push(pa);
			}
			
		}
		
		return used;
		
	};

	//color argument is a hexstring
	this.setColor = function(assetKey,channel,color,isPendingAction){
	
		var asset = this.collectionMaterials[assetKey];
		var used = false;
		if(asset !== null && asset !== undefined){				
			asset[channel] = new BABYLON.Color3.FromHexString(color).toLinearSpace();			
			used  = true;
		}else{
			
			if(isPendingAction === null || isPendingAction === undefined){
				var pa = new this.PendingAction();
				pa.function = "setColor";
				pa.arguments = [];
				for(var i=0;i<arguments.length;i++){
					pa.arguments.push(arguments[i]);
				}
				pa.arguments[3] = true;
				
				this.collectionMaterialsPendingActions.push(pa);
			}
			
		}
		return used;		
	};


	//color argument is a hexstring
	this.setEmmissive = function(assetKey,channel,intensity,isPendingAction){
	
		var asset = this.collectionMaterials[assetKey];
		var used = false;
		if(asset !== null && asset !== undefined){				
			asset[channel] = intensity;		
			used  = true;
		}else{
			
			if(isPendingAction === null || isPendingAction === undefined){
				var pa = new this.PendingAction();
				pa.function = "setEmmissive";
				pa.arguments = [];
				for(var i=0;i<arguments.length;i++){
					pa.arguments.push(arguments[i]);
				}
				pa.arguments[3] = true;
				
				this.collectionMaterialsPendingActions.push(pa);
			}
			
		}
		return used;		
	};
	

	this.processData = function(dataRef){
		//create root transformnode for rotation fix 
		this.rootTransformNode  = new BABYLON.TransformNode("root_transform_fix"); 
		this.rootTransformNode.rotation = new BABYLON.Vector3(-1.5708,0,0);
		this.rootTransformNode.scaling = new BABYLON.Vector3(-1,1,1);




		dataRef.ROOT.ASSET= SBJSCore.forceDataToArray(dataRef.ROOT.ASSET);
		for(var i=0;i<dataRef.ROOT.ASSET.length;i++){			
			this.createAsset(dataRef.ROOT.ASSET[i]);
		}
		
		
	};

	this.createAsset = function(dataRef){
	
		var a = new this.Asset(this);
		
		
		//key is manditory
		if(dataRef.KEY){
			a.key = dataRef.KEY.nodeValue;
		}else{
			console.error("createAsset called without a key , function aborted");
			return;
		}

		if(this.collectionAssets[a.key] !== null && this.collectionAssets[a.key] !== undefined){
			console.warn("createAsset called and the key to be used ::  "+a.key+"  :: has already been used , so this is going to cause an overwrite and unexpected behaviour");
		}

		//add to collection
		this.collectionAssets[a.key] =a;

		//url is optional , if omitted then it creates an empty
		if(dataRef.URL){
			a.url = dataRef.URL.nodeValue;
		}

		if(dataRef.PARENT){
			a.parent = dataRef.PARENT.nodeValue;
		};
			
		//handle transforms
		if(dataRef.TRANSFORM){
			for(var prop in dataRef.TRANSFORM){
				var t = a.collectionTransforms[prop] = new this.Transform();
				var d = dataRef.TRANSFORM[prop];
				if(d.L){
					var arr = d.L.nodeValue.split(",");
					t.location = new BABYLON.Vector3();
					t.location.x = parseFloat(arr[0]);
					t.location.y = parseFloat(arr[1]);
					t.location.z =  parseFloat(arr[2]);
					
				}
				if(d.R){
				    var arr = d.R.nodeValue.split(",");
					t.rotation = new BABYLON.Vector3();
					t.rotation.x =  parseFloat(arr[0]);
					t.rotation.y =  parseFloat(arr[1]);
					t.rotation.z =  parseFloat(arr[2]);
				
				}
				if(d.S){
					var arr = d.S.nodeValue.split(",");
					t.scaling = new BABYLON.Vector3();
					t.scaling.x =  parseFloat(arr[0]);
					t.scaling.y =  parseFloat(arr[1]);
					t.scaling.z =  parseFloat(arr[2]);
				
				}
				if(d.S_NEGATE_X){
					
					t.scalingNegateX = true; 
				
				}
			}
		}else{
		//if none is found gets a default transform
		
			a.collectionTransforms.DEFAULT = new this.Transform();
		}
		
		
		//needto create variants for groups!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		if(dataRef.VISIBILITY_FILTER){
			dataRef.VISIBILITY_FILTER = SBJSCore.forceDataToArray(dataRef.VISIBILITY_FILTER);
			for(var i=0;i<dataRef.VISIBILITY_FILTER.length;i++){
				a.visibilityFilterTargets.push(dataRef.VISIBILITY_FILTER[i].nodeValue);
			}	
			
		}
	
		if(dataRef.ASSET_GROUP){
			dataRef.ASSET_GROUP = SBJSCore.forceDataToArray(dataRef.ASSET_GROUP );
			for(var i=0;i<dataRef.ASSET_GROUP.length;i++){
				if(this.collectionAssetGroups[dataRef.ASSET_GROUP[i].nodeValue] === null || this.collectionAssetGroups[dataRef.ASSET_GROUP[i].nodeValue] === undefined ){
					this.collectionAssetGroups[dataRef.ASSET_GROUP[i].nodeValue] = [];
				}
				
				this.collectionAssetGroups[dataRef.ASSET_GROUP[i].nodeValue].push(a);
				this.collectionAssetGroups[dataRef.ASSET_GROUP[i].nodeValue].key = dataRef.ASSET_GROUP[i].nodeValue;
			}	
			
			
		}


		if(dataRef.VARIANT_GROUP){
			
			if(this.collectionAssetVariantGroups[dataRef.VARIANT_GROUP.nodeValue] === null || this.collectionAssetVariantGroups[dataRef.VARIANT_GROUP.nodeValue] === undefined ){
				this.collectionAssetVariantGroups[dataRef.VARIANT_GROUP.nodeValue] = {};
			}
			if(dataRef.VARIANT_ASSET_GROUP){
		
				this.collectionAssetVariantGroups[dataRef.VARIANT_GROUP.nodeValue][dataRef.VARIANT_KEY.nodeValue] = this.collectionAssetGroups[dataRef.VARIANT_ASSET_GROUP.nodeValue];
			}else{
				this.collectionAssetVariantGroups[dataRef.VARIANT_GROUP.nodeValue][dataRef.VARIANT_KEY.nodeValue] = a;
			}
					
			
		}


		//assetVariantGroups


		if(dataRef.LOAD_ASSET_ON_START){
			a.processLoading();
		}
	};
	

	


	/*
	//this is to load a mesh not described in the data , a key and a url need to be provided
	//an asset for this mesh will be created.
	this.loadMeshViaURL = function(meshKey,meshURL){
		
		if(this.collectionAssets[meshKey] !== null && this.collectionAssets[meshKey] !== undefined){
			console.warn("loadMeshViaURL called by the supplied key is already in use by the system , aborted");
			return;
		}

		//create an internal asset for this then call the regular loadMeshViaKey
		var a = new this.Asset();
		a.key = meshKey;
		a.url = meshURL;
		this.collectionAssets.lookup[a.key] =a;
		a.collectionTransforms.DEFAULT = new this.Transform();
		a.collectionDisplays.DEFAULT = true;

		this.loadMeshViaKey(meshKey);

  
	}*/


}