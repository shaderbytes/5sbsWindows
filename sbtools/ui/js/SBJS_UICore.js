


var SBJS_UICore = {};

SBJS_UICore.UIFilter = function() {
    // only one selected at a time , or multiple selections permitted
    this.name = "";
    //inverted default is false , this means wen filter is found , it performs the negative of type
    //eg hide or disable. If inverted is true it negates this logic
    this.inverted = false;
    //type default is 0 ,  0 is hide/show , type 1 is greyedout/ennabled
    this.type = 0;
    this.value = "";
};


SBJS_UICore.UISelectionGroup = function() {
    // only one selected at a time , or multiple selections permitted
    this.multiSelect = false;
  
    this.permitSelfDeselect = false;
    // the  active selection // singular
    this.itemSelectedCurrent;
    // the  active selection //  plural
    this.itemsSelectedCurrent = {};
    this.uniqueMultiChildIndex = 0;
};

SBJS_UICore.UISelectionGroup.prototype = {

    addMultiSelectChild: function(child) {
        if (child.multiSelectChildName !== undefined) {
            if (this.itemsSelectedCurrent[child.multiSelectChildName] !== undefined || this.itemsSelectedCurrent[child.multiSelectChildName] !== null) {
                //item already exists , abort
                return;
            }
        }
        child.multiSelectChildName = "child_" + this.uniqueMultiChildIndex;
        this.itemsSelectedCurrent[child.multiSelectChildName] = child;
        this.uniqueMultiChildIndex++;
    },
    removeMultiSelectChild: function(child) {
        this.itemsSelectedCurrent[child.multiSelectChildName] = null;
        delete this.itemsSelectedCurrent[child.multiSelectChildName];
        child.multiSelectChildName = "";
    }

};




SBJS_UICore.UIItemCore = function() {
    this.domElementContent = SBJSCore.HTMLDomFactory.createDomObject("div");
    this.domElementContentJQ = $(this.domElementContent);
    this.cssDisplay = "";
    this.cssDisplayCache = "";
    this.cssDisplayNotUsed = true;
    this.UIItemChildLookup = [];
    this.useParentStateNotification = false;
    this.name;
    this.parent;

    //these are the specific filters per UI object used to match those in assetVisibilityFilters
    this.visibilityFilterTargets = [];    
    this.hasVisibilityFilter = false;
    //this is the filter lookup applied to all UI
    this.assetVisibilityFilters = {};
    this.isVisible = true;
    
    this.offset;
    this.main = $("#main")[0];
   
    

}




SBJS_UICore.UIItemCore.prototype = {
    

    setCSS: function(classNameorIdName, IDName) {

        SBJSCore.HTMLDomFactory.setClassOrID(this.domElementContent, classNameorIdName, IDName);
        //cache the display value , because you cant just asume block anymore , could be flex value a well..
        this.cssDisplay = this.domElementContentJQ.css("display");
        if (this.cssDisplay === null || this.cssDisplay === undefined || this.cssDisplay === "") {
            this.cssDisplayNotUsed = true;
        } else {
            this.cssDisplayNotUsed = false;
        }


    },
    //use for adding other UIItems
    addChild: function(UIItemRef, mapTovariable, container) {
        //check if this item is a uiitem or not .. to target the add child
        if (container === null || container === undefined) {
            container = this.domElementContent;
        }
        //domElementChildrenContent.domElementContent
        var elementToAdd = UIItemRef;
        if (UIItemRef.domElementContent !== null && UIItemRef.domElementContent !== undefined) {
           
            elementToAdd = UIItemRef.domElementContent;
            UIItemRef.parent = this;
            this.UIItemChildLookup.push(UIItemRef);
        } 

        container.appendChild(elementToAdd);

        if (mapTovariable !== null && mapTovariable !== undefined) {
            this[mapTovariable] = UIItemRef;
            this[mapTovariable + "JQ"] = $(elementToAdd);
        }
    },
    setVisibility: function(stateToSet) {
        this.isVisible = stateToSet;
        if (stateToSet) {
            //even though is now capable of being visible due to isVisible , still have to respect isVisibleViaFilter property
            if(!this.hasVisibilityFilter){
                this.domElementContentJQ.css("display", this.cssDisplay);
            }
            
        } else {
            this.domElementContentJQ.css("display", "none");
        }
    },
    setVisibilityForFilter: function(state,filterType) {
  
       this.hasVisibilityFilter = !state;
       
       if(state){          
            //even though is now capable of being visible  , still have to respect the actual isVisible property 
            if(this.isVisible){
                this.domElementContentJQ.css("display", this.cssDisplay);
            }          
   
       }else{

           this.domElementContentJQ.css("display", "none");
       
       }


    },
    notifyChildrenOfState:function(stateToNotify){
       
        for(var i=0;i<this.UIItemChildLookup.length;i++){
            this.UIItemChildLookup[i].receiveNotificationOfParentState(stateToNotify);
        }
    },
    receiveNotificationOfParentState:function(stateNotified){
      var notificationToUse; 
      for(var i=0;i<this.UIItemChildLookup.length;i++){
           notificationToUse = stateNotified;
           if(this.isSelected !== null && this.isSelected !== undefined){
                notificationToUse = this.isSelected;
           }
            this.UIItemChildLookup[i].receiveNotificationOfParentState(notificationToUse);
        }
    }

};




//UIItemController------------------------------------------------------------------------------------------------------------------------------



SBJS_UICore.UIItemController = function() {

    SBJSCore.UIItemEventDispatcher.call(this);
    SBJS_UICore.UIItemCore.call(this);

    this.domElementContainer;
    this.domElementContainerJQ;
    this.domElementToolsContainer;    
    this.domEventCache = {};
    this.eventHookCustomCache = {};   
    this.offset = 0;
    this.isSelected = false;
    this.treeLinesActive = false;
    this.treeLinesActiveCache = false;
    this.selectionGroups = {};
    this.isOrientationLandscape = true;
    this.UID = SBJSCore.HTMLDomFactory.uniqueSelectorGenerator("");
    this.themeSetCurrent;
    this.postBuildActions = [];
   
   

};




var UIItemControllerPrototype = {

    setOrientation:function(isLandscape){
    this.isOrientationLandscape = isLandscape;
        if(isLandscape){
            this.treeLinesActive = this.treeLinesActiveCache;
            this.setTreeLineVisibility();
    
        }else{
         this.treeLinesActiveCache = this.treeLinesActive;
         this.treeLinesActive = false;
         this.setTreeLineVisibility();
        }

        this.invalidateScroll();
    },

    dispatchInternalEvent:function(event){       

        this.dispatchEvent(event.data.eventName, event);
    },

    build: function(domElementContainerRef) {
        this.domElementContainer = domElementContainerRef;
        this.domElementContainerJQ = $(this.domElementContainer);
        this.domElementContainer.appendChild(this.domElementContent);

    },


    setAssetVisibilityFilter: function(filter,value){
  
        var val = true;
        if(value !== null && value !== undefined){
            val = value;
        }

    
		this.assetVisibilityFilters[filter] = val;
		
	},

	removeAssetVisibilityFilter:function(filter,value){	
        var val = false;
        if(value !== null && value !== undefined){
            val = value;
        }

		this.assetVisibilityFilters[filter] = val;
		
	},
    invalidateAssetsForVisibilityFilters:function(){
      this.dispatchEvent(this.EVENT_INVALIDATE_TIER_3, this);
    
    },

    getOffset: function(el) {
        var _x = 0;
        var _y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return {
            top: _y,
            left: _x
        };
    },

    invalidateScroll: function(UIItemRef) {        

        if(!this.isOrientationLandscape){
            this.domElementContentJQ.css("padding-right", "");
        }else{
            //for padding the scroll bar , it looks bad without it
            if (this.domElementContent.scrollTop > 0 || (this.domElementContent.scrollHeight > this.domElementContent.clientHeight)) {
                this.domElementContentJQ.css("padding-right", "15px");
            } else {
                this.domElementContentJQ.css("padding-right", "");
            }       
        }

        
        if (UIItemRef !== null && UIItemRef !== undefined) {
         
            var offsetDiff = UIItemRef.offset.top;          
            if(this.isOrientationLandscape){
                UIItemRef.UIItemController.domElementContent.scrollTo(0,  UIItemRef.domElementContent.offsetTop-UIItemRef.offset.top+UIItemRef.UIItemController.domElementContainer.offsetTop);
            }else{
                this.main.scrollTo(0,  UIItemRef.domElementContent.offsetTop-UIItemRef.offset.top);
            }
        }

    },
    UIItemControllerTools: function(domElementToolsContainerRef) {
        this.domElementToolsContainer = new SBJS_UICore.UIItemCore();
         domElementToolsContainerRef.appendChild(this.domElementToolsContainer.domElementContent);
        
    },  
    processPostBuildActions:function(){
        for(var i=0;i< this.postBuildActions.length;i++){
            var pba = this.postBuildActions[i];
            pba.func.apply(pba.scope,pba.arguments);
    
        }
        this.postBuildActions = [];
    },
    //used after build once for full invalidations , resizing and filtering
    invalidatePostBuild: function() {

        this.dispatchEvent(this.EVENT_INVALIDATE_TIER_0, this);
        this.setTreeLineVisibility();
        this.dispatchEvent(this.EVENT_INVALIDATE_TIER_1, this);
        this.dispatchEvent(this.EVENT_RESIZE, this);
        this.dispatchEvent(this.EVENT_INVALIDATE_TIER_2, this);
        this.processPostBuildActions();
        this.invalidateAssetsForVisibilityFilters();
    },   
      
    resize: function() {
        var displaycache = this.domElementContentJQ.css("display");
        this.domElementContentJQ.css("display", "block");
        this.dispatchEvent(this.EVENT_INVALIDATE_TIER_0, this);
        this.invalidateScroll();
        this.dispatchEvent(this.EVENT_RESIZE, this);
        this.dispatchEvent(this.EVENT_INVALIDATE_TIER_2, this);
        this.domElementContentJQ.css("display", displaycache);

    },
    setTreeLineVisibility: function() {
        var scope = this;
        $(".ui-item-accordian-child-container").each(function(index) {
            var d = $(this);
            if (!scope.treeLinesActive) {
                d.addClass("no-border-important");
                d.addClass("no-padding-important");
            } else {
                d.removeClass("no-border-important");
                d.removeClass("no-padding-important");
            }

        });

    },
    setTheme: function(themeSetNew) {

        //remove old theme if required
        if (this.themeSetCurrent !== null && this.themeSetCurrent !== undefined) {
            for (var i = 0; i < this.themeSetCurrent.UI.length; i++) {
                var UI = this.themeSetCurrent.UI[i];
                var scope = this;
                $(UI.SELECTOR.nodeValue).each(function(index) {
                    scope.removeTheme(this, UI.THEME.nodeValue);
                });

            }
        }

        this.themeSetCurrent = themeSetNew;
        if (this.themeSetCurrent !== null && this.themeSetCurrent !== undefined) {
            for (var i = 0; i < this.themeSetCurrent.UI.length; i++) {
                var UI = this.themeSetCurrent.UI[i];
                var scope = this;
                $(UI.SELECTOR.nodeValue).each(function(index) {
                    scope.addTheme(this, UI.THEME.nodeValue);
                });
            }
        }

        this.dispatchEvent(this.EVENT_UPDATE_HILIGHTS, this);
    },
    processDomEvents: function(UIItemRef) {
        if (UIItemRef.domEvents !== null && UIItemRef.domEvents !== undefined) {

            //regular hooks are attached to the root container so we dont want to attach the same event twice
            //so they get cached and reused 
            for (var prop in UIItemRef.domEvents) {
                var eventName = prop;

                var UID;
                if (this.domEventCache[eventName] === null || this.domEventCache[eventName] === undefined) {
                    this.domEventCache[eventName] = UID = SBJSCore.HTMLDomFactory.uniqueSelectorGenerator("");
                    this.domElementContainerJQ.on(eventName, "." + UID, function(e) {
                        var UIItemTemp = $(e.currentTarget).data("UIItem");
                        UIItemTemp.processInteraction(e);


                    });
                } else {
                    UID = this.domEventCache[eventName];
                }

                SBJSCore.HTMLDomFactory.appendClass(UIItemRef.domElementContent, UID);
                UIItemRef.domElementContentJQ.data("UIItem", UIItemRef);
            }
        }
    },
    removeTheme: function(DOMElement, theme) {

        SBJSCore.HTMLDomFactory.removeClass(DOMElement, theme);
    },
    addTheme: function(DOMElement, theme) {

        SBJSCore.HTMLDomFactory.appendClass(DOMElement, theme);
    }


};

var inherit_1 = Object.create(SBJSCore.UIItemEventDispatcher.prototype);

Object.assign(inherit_1, SBJS_UICore.UIItemCore.prototype);

var inherit_2 = Object.create(inherit_1);

Object.assign(inherit_2, UIItemControllerPrototype);

SBJS_UICore.UIItemController.prototype = inherit_2;
SBJS_UICore.UIItemController.prototype.constructor = SBJS_UICore.UIItemController;



//UIItem------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------


SBJS_UICore.UIItem = function() {
   
    SBJSCore.UIItemEventDispatcher.call(this);
    SBJS_UICore.UIItemCore.call(this);
    this.UIItemController;     
    this.domEvents = {};
    //this is what is required to trigger the event on build. 
    // if this is false the values and display will be set up but no events triggered. 
    this.permitEventDispatchOnBuild = false;
    //going to create a variable to cache this here for if a UIItemLabel is added , so hilight functions can look it up with ease.
    this.uiitemLabel = null;


};



var UIItemPrototype = {
   
    initialize: function(UIItemControllerRef) {
       
        this.UIItemController = UIItemControllerRef;       
       
        // nastly html DOM issues , cant get width of objects not visible , so have to resport to a three step setup
        if (this.onInvalidateTier0 !== null && this.onInvalidateTier0 !== undefined) {
            this.UIItemController.addEventListener(this.EVENT_INVALIDATE_TIER_0, this.onInvalidateTier0.bind(this)); //force visible
        }
        if (this.onInvalidateTier1 !== null && this.onInvalidateTier1 !== undefined) {
            this.UIItemController.addEventListener(this.EVENT_INVALIDATE_TIER_1, this.onInvalidateTier1.bind(this)); //handle props and layout
        }
        if (this.onInvalidateTier2 !== null && this.onInvalidateTier2 !== undefined) {
            this.UIItemController.addEventListener(this.EVENT_INVALIDATE_TIER_2, this.onInvalidateTier2.bind(this)); //reset visible states as required
        }
        if (this.onInvalidateTier3 !== null && this.onInvalidateTier3 !== undefined) {
            this.UIItemController.addEventListener(this.EVENT_INVALIDATE_TIER_3, this.onInvalidateTier3.bind(this)); //filters
        }
        if (this.onResize !== null && this.onResize !== undefined) {
            this.UIItemController.addEventListener(this.EVENT_RESIZE, this.onResize.bind(this));
        }
        if (this.onUpdateHilights !== null && this.onUpdateHilights !== undefined) {
            this.UIItemController.addEventListener(this.EVENT_UPDATE_HILIGHTS, this.onUpdateHilights.bind(this));
        }




    },
    addDomEvent: function(eventNameRef, callbackRef, dataRef) {

        var eo = new this.event();
        eo.UIItemTarget = this;
        eo.eventName = eventNameRef;
        eo.callback = callbackRef;
        eo.data = dataRef;
        this.domEvents[eo.eventName] = eo;
        this.UIItemController.processDomEvents(this);

    },
    processInteraction: function(e) {
       
        if (this.domEvents[e.type] !== null && this.domEvents[e.type] !== undefined) {
            this.domEvents[e.type].mouseEvent = e;
            this.domEvents[e.type].callback(this.domEvents[e.type]);
            this.processInteractionExternalEvent(this.domEvents[e.type]);
           
        }

    },
    processInteractionExternalEvent:function(e){
     this.dispatchEvent(e.mouseEvent.type, e);
    },
    event: function() {
        this.UIItemTarget;
        this.eventName;
        this.callback;
        this.data;
        this.mouseEvent;
    },
    //inherited items dont need to shadow this implementation
    // !IMPORTANT for any html based system to be able to work properly in regards to dynamic sizing via scripting,  nothing can be hidden on start up. 
    onInvalidateTier0: function(event) {
        //force visibility here , the code will sort out the correct visible state in Tier 1 or 2   
        if (!this.cssDisplayNotUsed) {
            this.cssDisplayCache = this.domElementContentJQ.css("display");
            this.domElementContentJQ.css("display", this.cssDisplay);

        }


    },
    onInvalidateTier1: function(event) {
        //invalidate the cache , must be redone in inherited items that shadow this
        this.cssDisplayCache = this.domElementContentJQ.css("display");



    },
    //inherited items dont need to shadow this implementation
    onInvalidateTier2: function(event) {
        // this function only uses the display cahce value for restoring the item to the state it is meant to be in. 
        if (!this.cssDisplayNotUsed) {
            this.domElementContentJQ.css("display", this.cssDisplayCache);
        }


    },
    //inherited items dont need to shadow this implementation
    onInvalidateTier3: function(event) {

        var filterFound = false;
		for(var j=0;j<this.visibilityFilterTargets.length;j++){
            var fl = this.visibilityFilterTargets[j];
            var fg =  this.UIItemController.assetVisibilityFilters[fl.name];
            if(!fl.inverted){
                if(fg !== null && fg !== undefined){
                    if(fg === true || (fg === fl.value)){
                        filterFound = true;
                        this.setVisibilityForFilter(false,fl.type); 
                        break;
                    }            
                }            
            }else{
               
                if(fg === null || fg === undefined || fg === false || (fg !== fl.value)){ 
                    filterFound = true;
                    this.setVisibilityForFilter(false,fl.type); 
                    break;
                }
                if(fg === true || (fg === fl.value)){                    
                    this.setVisibilityForFilter(true,fl.type);                                 
                }            
            }                   
			
		}
		if(!filterFound){
            if(this.hasVisibilityFilter){
              
			    this.setVisibilityForFilter(true);   
            }
		}

    },
    onResize: function(event) {
        
    }




}

var inherit_2 = Object.create(inherit_1);
Object.assign(inherit_2, UIItemPrototype);
SBJS_UICore.UIItem.prototype = inherit_2;
SBJS_UICore.UIItem.prototype.constructor = SBJS_UICore.UIItem;




//UIItemLabel------------------------------------------------------------------------------------------------------------------------------


SBJS_UICore.UIItemLabel = function(textValue) {
    SBJS_UICore.UIItem.call(this);   
    this.domElementText;
    this.domElementTextJQ;
    



};



var UIItemLabelPrototype = {
    build: function(textValue) {
        this.domElementText = SBJSCore.HTMLDomFactory.createDomObject("p");
        this.domElementContent.appendChild(this.domElementText);
        this.domElementTextJQ = $(this.domElementText);
        SBJSCore.HTMLDomFactory.createTextNode(this.domElementText, textValue);
        this.name = textValue;
    },

    updateText: function(newText) {
        this.domElementText.childNodes[0].nodeValue = newText;
        this.name = textValue;
    }

}


var inherit_2 = Object.create(SBJS_UICore.UIItem.prototype);
Object.assign(inherit_2, UIItemLabelPrototype);
SBJS_UICore.UIItemLabel.prototype = inherit_2;
SBJS_UICore.UIItemLabel.prototype.constructor = SBJS_UICore.UIItemLabel;


//UIItemIconImage------------------------------------------------------------------------------------------------------------------------------


SBJS_UICore.UIItemIconImage = function() {
    SBJS_UICore.UIItem.call(this); 
    this.URLS;
    this.URLCurrent;
    this.image;    
};


var UIItemIconImagePrototype = {

    build: function(URLSRef) {
        this.URLS = SBJSCore.forceDataToArray(URLSRef);
        this.setImageIndex(0);
    },

    setImageIndex: function(index) {
       
        this.URLCurrent = this.URLS[index];       
        if (this.URLCurrent !== null && this.URLCurrent !== undefined && this.URLCurrent !== "") {
            this.imageJQ.css("background-image", "url('" + this.URLCurrent + "')");
           
        }

    }

}


var inherit_2 = Object.create(SBJS_UICore.UIItem.prototype);
Object.assign(inherit_2, UIItemIconImagePrototype);
SBJS_UICore.UIItemIconImage.prototype = inherit_2;
SBJS_UICore.UIItemIconImage.prototype.constructor = SBJS_UICore.UIItemIconImage;


//UIItemIcon------------------------------------------------------------------------------------------------------------------------------


SBJS_UICore.UIItemIcon = function() {
    SBJS_UICore.UIItem.call(this);
  
    this.URLS;
    this.URLCurrent;
    this.mask;
};



var UIItemIconPrototype = {

    build: function(URLSRef) {
        this.URLS = SBJSCore.forceDataToArray(URLSRef);
        this.setIconIndex(0);
    },

    setIconIndex: function(index) {
    
        this.URLCurrent = this.URLS[index];
        if (this.URLCurrent !== null && this.URLCurrent !== undefined && this.URLCurrent !== "") {
            this.maskJQ.css("-webkit-mask-image", "url('" + this.URLCurrent + "')");
            this.maskJQ.css("mask-image", "url('" + this.URLCurrent + "')");
        }

    }

}


var inherit_2 = Object.create(SBJS_UICore.UIItem.prototype);
Object.assign(inherit_2, UIItemIconPrototype);
SBJS_UICore.UIItemIcon.prototype = inherit_2;
SBJS_UICore.UIItemIcon.prototype.constructor = SBJS_UICore.UIItemIcon;


//UIItemInput------------------------------------------------------------------------------------------------------------------------------


SBJS_UICore.UIItemInput = function() {

    SBJS_UICore.UIItem.call(this);
   

    var UID = SBJSCore.HTMLDomFactory.uniqueSelectorGenerator("");
    this.inputLabel = SBJSCore.HTMLDomFactory.createDomObject("label");
    SBJSCore.HTMLDomFactory.createTextNode(this.inputLabel, label);
    SBJSCore.HTMLDomFactory.setElementAttributes(this.inputLabel, {
        "for": UID
    });
    this.inputField = SBJSCore.HTMLDomFactory.createDomObject("input");
    SBJSCore.HTMLDomFactory.setElementAttributes(this.inputField, {
        "type": "text",
        "id": UID
    });
    this.domElementContentInteractionTarget = this.inputField;

};



var UIItemInputPrototype = {

    build: function() {
        this.domElementContent.appendChild(this.inputLabel);
        this.domElementContent.appendChild(this.inputField);
    },

    setCSSLabel: function(className, IDName) {
        SBJSCore.HTMLDomFactory.setClassOrID(this.inputLabel, className, IDName);
    },

    setCSSField: function(className, IDName) {
        SBJSCore.HTMLDomFactory.setClassOrID(this.inputField, className, IDName);
    }



};

var inherit_2 = Object.create(SBJS_UICore.UIItem.prototype);
Object.assign(inherit_2, UIItemInputPrototype);
SBJS_UICore.UIItemInput.prototype = inherit_2;
SBJS_UICore.UIItemInput.prototype.constructor = SBJS_UICore.UIItemInput;


//UIItemAccordian---------------------------------------------------------------------------------------------------------------------------

SBJS_UICore.UIItemAccordian = function() {
    SBJS_UICore.UIItem.call(this);  
    //since the display state has to be visible for set up it makes more sense to have the defaults match those settings
    this.isSelected = true;
    this.isDomElementChildrenContentVisble = true;
    this.headerButton;


};



var UIItemAccordianPrototype = {

    build: function(headerButtonRef) {
        this.headerButton = headerButtonRef;
        this.headerButton.addEventListener(this.EVENT_DOM_CLICK, this.onHeaderClick.bind(this), null);
        this.domElementContent.appendChild(this.headerButton.domElementContent);
        this.domElementChildrenContent = new SBJS_UICore.UIItem();
        this.domElementChildrenContent.initialize(this.UIItemController);
        this.domElementContent.appendChild(this.domElementChildrenContent.domElementContent);
        //add generic class so can be looked up with ease to add tree lines
        SBJSCore.HTMLDomFactory.setClassOrID(this.domElementChildrenContent.domElementContent, "ui-item-accordian-child-container");
    },

    onHeaderClick: function(e) {        
        this.isSelected = e.UIItemTarget.isSelected;        
        this.domElementChildrenContent.setVisibility(this.isSelected);
        if( this.isSelected){
            this.UIItemController.invalidateScroll(this.headerButton);
        }
        this.dispatchEvent(e.type, this.domEvents[e.type]);
       // console.log("about to call notifyChildrenOfState from accordian");
       // console.log(this.domElementChildrenContent.UIItemChildLookup);
        this.domElementChildrenContent.notifyChildrenOfState(this.isSelected);
    },

    onInvalidateTier1: function(event) {
        // ok so an accordian open close state is controlled via a button as well as the event
        //so we transfer the accordians desired sest up states to the button here. 

        //DO NOT  INVERT the isSelected state here because it will be inverted in the button. 
        this.headerButton.isSelected = this.isSelected;
        this.headerButton.permitEventDispatchOnBuild = this.permitEventDispatchOnBuild;

        //check permitEventDispatchOnBuild is false , if so handle setting up te accordian display state
        //if it is true then we know it was handled via the button event trigger
        if (!this.permitEventDispatchOnBuild) {
            this.domElementChildrenContent.setVisibility(this.isSelected);

        }
        this.cssDisplayCache = this.domElementContentJQ.css("display");

    }
};


var inherit_2 = Object.create(SBJS_UICore.UIItem.prototype);
Object.assign(inherit_2, UIItemAccordianPrototype);
SBJS_UICore.UIItemAccordian.prototype = inherit_2;
SBJS_UICore.UIItemAccordian.prototype.constructor = SBJS_UICore.UIItemAccordian;

//UIItemSlider---------------------------------------------------------------------------------------------------------------------------

SBJS_UICore.UIItemSlider = function() {
    SBJS_UICore.UIItem.call(this);
   
    this.label;
    this.scrubberTrackContainer;
    this.scrubberButton;
    this.scrubberTrack;
    this.MousePositionCashedX = 0;
    this.objectPositionCachedX = 0;
    this.widthForCalculations = 0;
    this.widthContainer = 0;
    this.value = 0;
    this.xPos = 0;
    this.valueNormalized = 0;
    this.scrubberWidth = 0;


};



var UIItemSliderPrototype = {

    build: function(headerButtonRef) {
        this.label = new SBJS_UICore.UIItemLabel("");
        this.label.initialize(this.UIItemController);
        this.label.build();
        this.scrubberTrackContainer = new SBJS_UICore.UIItem();
        this.scrubberTrackContainer.initialize(this.UIItemController);
        this.scrubberButton = new SBJS_UICore.UIItemButton();
        this.scrubberButton.initialize(this.UIItemController);
        this.scrubberButton.build();
        this.scrubberTrack = new SBJS_UICore.UIItemButton();
        this.scrubberTrack.initialize(this.UIItemController);
        this.scrubberTrack.build();
        this.scrubberTrack.addDomEvent(this.EVENT_DOM_CLICK, this.onScrubberTrackContainerClick.bind(this), null);
        this.scrubberButton.addDomEvent(this.EVENT_DOM_MOUSE_DOWN, this.onScrubberButtonDown.bind(this), null);
        this.addChild(this.label);
        this.addChild(this.scrubberTrackContainer);
        this.scrubberTrackContainer.addChild(this.scrubberTrack);
        this.scrubberTrackContainer.addChild(this.scrubberButton);
    },
    onScrubberTrackContainerClick: function(e) {

    },
    calculateMouseMove: function(e) {
        var xdiff = e.pageX - this.MousePositionCashedX;

        this.xPos = (this.value + xdiff);
        if (this.xPos > this.widthForCalculations) {
            this.xPos = this.widthForCalculations;
        }
        if (this.xPos < 0) {
            this.xPos = 0;
        }

        this.valueNormalized = this.getSliderValueNormalized();
        this.scrubberButton.domElementContentJQ.css("left", this.xPos + "px");
        this.dispatchEvent(this.EVENT_DOM_MOUSE_MOVE, this.valueNormalized);
    },

    onBodyMouseUp: function() {
        this.value = this.xPos;
        $(document).off("mousemove." + this.UIItemController.UID);
        $(document).off("mouseup." + this.UIItemController.UID);

    },

    getSliderValueNormalized: function() {

        return this.xPos / this.widthForCalculations;
    },

    onInvalidateTier1: function(event) {
        //always set up - either just the default values from this object or injected values from the data
        this.setSliderValue(this.valueNormalized);

        //optional dispatch , this variable is controlled from the data the internal default value is false
        if (this.permitEventDispatchOnBuild) {
            this.dispatchEvent(this.EVENT_DOM_MOUSE_MOVE, this.valueNormalized);
        }

        this.cssDisplayCache = this.domElementContentJQ.css("display");

    },

    onResize: function(event) {
        // console.log("onResize slider ");

        //set scrubber and slider width to zero to get the container width without them affecting it
        this.scrubberTrack.domElementContentJQ.css("width", 0);
        this.scrubberButton.domElementContentJQ.css("width", 0);

        this.widthContainer = this.scrubberTrackContainer.domElementContentJQ.outerWidth();
        if (this.widthContainer === 0) {
            this.scrubberTrack.domElementContentJQ.css("width", "");
            this.scrubberButton.domElementContentJQ.css("width", "");
            return;
        }
        this.scrubberTrack.domElementContentJQ.css("width", "");
        this.scrubberButton.domElementContentJQ.css("width", "");

        //console.log("widthContainer "+ this.widthContainer);

        //get width of scrubber;
        this.scrubberWidth = this.scrubberButton.domElementContentJQ.outerWidth();
        // console.log("scrubberWidth "+ this.scrubberWidth);


        //set track width minus scrubber width
        this.widthForCalculations = this.widthContainer - this.scrubberWidth;
        // console.log("widthForCalculations "+ this.widthForCalculations);
        this.scrubberTrack.domElementContentJQ.css("width", this.widthForCalculations + "px")

    },

    setSliderValue: function(value) {
        // console.log("setSliderValue");
        //sanitize value
        if (value < 0) {
            value = 0;
        }
        if (value > 1) {
            value = 1;
        }

        this.xPos = (this.widthForCalculations * value);
        this.value = this.xPos;
        this.scrubberButton.domElementContentJQ.css("left", this.value + "px");

    },

    onScrubberButtonDown: function(e) {
        this.MousePositionCashedX = e.mouseEvent.pageX;
        this.objectPositionCachedX = this.scrubberTrackContainer.domElementContentJQ.position().left;
        $(document).on("mousemove." + this.UIItemController.UID, this.calculateMouseMove.bind(this));
        $(document).on("mouseup." + this.UIItemController.UID, this.onBodyMouseUp.bind(this));
    }

};

var inherit_2 = Object.create(SBJS_UICore.UIItem.prototype);
Object.assign(inherit_2, UIItemSliderPrototype);
SBJS_UICore.UIItemSlider.prototype = inherit_2;
SBJS_UICore.UIItemSlider.prototype.constructor = SBJS_UICore.UIItemSlider;


//UIItemButton------------------------------------------------------------------------------------------------------------------------------

SBJS_UICore.UIItemButton = function() {
    SBJS_UICore.UIItem.call(this);   
    this.isSelected = false;
    this.toggleSelectedState = true;
    this.alwaystriggerOnInternalTrigger = false;
    this.selectionGroup;
    this.hilight = undefined;
    


};



var UIItemButtonPrototype = {
    eventInternalTriggerListener:function(event){
      
        // dont care about isVisible but do care about hasVisibilityFilter,
        //so hidden buttons can be triggered but not filtered buttons
       
        if(!this.hasVisibilityFilter){
            if(!this.toggleSelectedState){
                //if false you dont care about the button state
                this.domElementContentJQ.trigger(this.EVENT_DOM_CLICK);
            }else if(this.alwaystriggerOnInternalTrigger){

                if(this.isSelected === true){
                    //invert the state before trigger so it results in the same state it was in
                    this.isSelected = !this.isSelected;                    
                }
                this.domElementContentJQ.trigger(this.EVENT_DOM_CLICK);
            
            }else{
                //if true check the data to know if to keep state (invert state before trigger) or just trigger ( which will invert the state)
                if(event.data.keepState){
                    if(event.data.keepState === true){
                        //since we keeping state , is isSlected is false , it means no need to trigger
                        if(this.isSelected === true){
                            //invert the state before trigger so it results in the same state it was in
                            this.isSelected = !this.isSelected;
                            this.domElementContentJQ.trigger(this.EVENT_DOM_CLICK);
                        }

                       
                    }else{
                         //natural click , will invert the state
                         this.domElementContentJQ.trigger(this.EVENT_DOM_CLICK);
                    }
                }else{
                    //keepState boolean not found , so just trigger anyway
                    this.domElementContentJQ.trigger(this.EVENT_DOM_CLICK);
                }
            }

           
        }
    },
    build: function() {
        //dom event added by default here .. this is a button so treat it like one.
        this.addDomEvent(this.EVENT_DOM_CLICK, this.onClick.bind(this), null);
    },
    onClick: function(e) {
        this.offset = this.UIItemController.getOffset(this.domElementContent);
        if (this.selectionGroup !== null && this.selectionGroup !== undefined) {

            if (this.selectionGroup.multiSelect) {
                //multiselect
                this.isSelected = !this.isSelected;
                if (this.isSelected) {
                    this.selectionGroup.addMultiSelectChild(this);
                } else {
                    this.selectionGroup.removeMultiSelectChild(this);
                }
               
            } else {
                //single select
               
                if (e !== null && e !== undefined) {
                    if (this.selectionGroup.itemSelectedCurrent !== null && this.selectionGroup.itemSelectedCurrent !== undefined) {
                        if( this.selectionGroup.itemSelectedCurrent.isSelected === true){
                            if(this.selectionGroup.itemSelectedCurrent === this){
                                 if(!this.selectionGroup.permitSelfDeselect){
                                     //early out as selecting the same item twice must have no action
                                     return;
                                 }

                            }
                            this.selectionGroup.itemSelectedCurrent.isSelected = false;
                            if (this.selectionGroup.itemSelectedCurrent.icon !== null && this.selectionGroup.itemSelectedCurrent.icon !== undefined) {
                                this.selectionGroup.itemSelectedCurrent.icon.setIconIndex(0);
                             }
                             //handle hilight
                            if(this.selectionGroup.itemSelectedCurrent.hilight !== null && this.selectionGroup.itemSelectedCurrent.hilight !== undefined){
                                SBJS_UIHilights.actions[this.selectionGroup.itemSelectedCurrent.hilight](this.selectionGroup.itemSelectedCurrent);
                            }
                            this.selectionGroup.itemSelectedCurrent.processInteractionExternalEvent(e);
                            if(this.selectionGroup.permitSelfDeselect){
                                if(this.selectionGroup.itemSelectedCurrent === this){
                                     this.selectionGroup.itemSelectedCurrent = null;
                                    this.notifyChildrenOfState( this.isSelected);
                                    return;

                                }
                            }
                        }
                    }
                    
                }
                this.isSelected = ! this.isSelected;
                //TODO
                //process highlight to select or deselect
               

                if(this.isSelected){
                    this.selectionGroup.itemSelectedCurrent = this;
                }else{
                // commented out as it caused problems with selected items via data on load
                   // this.selectionGroup.itemSelectedCurrent = null;
                }

               
              

            }


        } else {
            // not part of selection group so just process as unique button which
            //is either toggle or not
            if (this.toggleSelectedState) {
                this.isSelected = !this.isSelected;

            }
            //if not part of a selection group and toggleSelectedState is false .. it is a cyclic button
            //meaning you probably just want it to be able to be click any amount of times and state make no difference
        }
       
        if (this.icon !== null && this.icon !== undefined) {
          
            if (this.isSelected) {
                this.icon.setIconIndex(1);
            } else {
                this.icon.setIconIndex(0);
            }

        }
        //handle hilight
        if(this.hilight !== null && this.hilight !== undefined){             
            SBJS_UIHilights.actions[this.hilight](this);
        }

       //notify children
        this.notifyChildrenOfState( this.isSelected);


    },




    //SELECTION GROUPING--------------------------------------------------------------
    //a button can belong to a selection group
    //if it belongs to a group it is either multiselect or single select



    assignToSelectionGroup: function(selectionGroupRef) {
        if (selectionGroupRef === undefined || selectionGroupRef === null) {
            console.error("assignToSelectionGroup called in UIItemButton but the 'selectionGroupRef' argument is null or undefined. please call assignToSelectionGroup and pass in a valid UISelectionGroup object");
            return;
        }
        if (!selectionGroupRef instanceof SBJS_UICore.UISelectionGroup) {
            console.error("assignToSelectionGroup called in UIItemButton but the 'selectionGroupRef' argument is not an instance of UISelectionGroup. Please assign pass in a valid instance of a UISelectionGroup object");
            return;
        }
        this.selectionGroup = selectionGroupRef;

    },

    onUpdateHilights: function(event) {
     
        //handle hilight
        if(this.hilight !== null && this.hilight !== undefined){
            SBJS_UIHilights.actions[this.hilight](this);
        }

    },


    onInvalidateTier1: function(event) {

        //always set up the button according tot he state. either the default values of this objeect or the injected values from the data
        //this functionality is different in that at this point you have to evaluate "permitEventDispatchOnBuild" to do it via a triggered click
        //or just via props and display;

        //also take note the action of a button is to toggle isSelected , so you need to invert it here before calling for any setup
        // this will ensure you land on the desired state.
        this.isSelected = !this.isSelected;
        if(this.permitEventDispatchOnPostBuild){
            var ob = {};
            ob.scope = this.domElementContentJQ;
            ob.func = this.domElementContentJQ.trigger;
            ob.arguments = [this.EVENT_DOM_CLICK];
            this.UIItemController.postBuildActions.push(ob);
        }else{

             if (this.permitEventDispatchOnBuild) {
                this.domElementContentJQ.trigger(this.EVENT_DOM_CLICK);
            } else {
                //ok so no event must happen now but still needss to be set up
                this.onClick();
            }
        
        }
       

    },
    receiveNotificationOfParentState:function(stateNotified){
        // console.log("receiveNotificationOfParentState stateNotified "+stateNotified +" in "+this.name+" useParentStateNotification "+this.useParentStateNotification+" isSelected "+this.isSelected);
        if(this.useParentStateNotification === true){
            if(!this.hasVisibilityFilter){
                if(stateNotified === true){
                    if(this.isSelected === true){
                   
                       // console.log(this);
                       // console.log("===========================================");
                         //also take note the action of a button is to toggle isSelected , so you need to invert it here before calling for triggering based on current state
                        // this will ensure you land on the desired state.
                        this.isSelected = !this.isSelected;
                        this.domElementContentJQ.trigger(this.EVENT_DOM_CLICK);
                    }
                }
            }
        }
        //console.log("receiveNotificationOfParentState called stateNotified "+stateNotified);
       // console.log(this.domElementContent);
    }

};

var inherit_2 = Object.create(SBJS_UICore.UIItem.prototype);
Object.assign(inherit_2, UIItemButtonPrototype);
SBJS_UICore.UIItemButton.prototype = inherit_2;
SBJS_UICore.UIItemButton.prototype.constructor = SBJS_UICore.UIItemButton;



function SBColorUtility() {
    var classScope = this;
    var hsl = {
        "hue": 0,
        "saturation": 50,
        "luminosity": 50
    };
    var hex = "";
    var rgb = {
        "r": 0,
        "g": 0,
        "b": 0
    };
    var gamma = 2.4;

    this.expandHexShortToFull = function(hex) {
        // console.log("expandHexShortToFull " + hex);
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        return hex;

    };

    //-------------------------------------------------------------------------------------------------------

    this.hslToRgb = function(h, s, l) {
        // console.log("hslToRgb called " + h + " " + s + " " + l);
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        rgb.r = Math.round(r * 255);
        rgb.g = Math.round(g * 255);
        rgb.b = Math.round(b * 255);


    };

    //-------------------------------------------------------------------------------------------------------

    this.hexToHSL = function(hex) {
        //console.log("hexToHSL called " + hex);
        hex = this.expandHexShortToFull(hex);
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);
        rgb.r = r;
        rgb.g = g;
        rgb.b = b;
        hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

        //#45b8a1 r69 g184 b161
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        s = s * 100;
        s = Math.round(s);
        l = l * 100;
        l = Math.round(l);
        h = Math.round(360 * h)

        hsl.hue = h;
        hsl.saturation = s;
        hsl.luminosity = l;



    };

    //-------------------------------------------------------------------------------------------------------

    this.hexToRGB = function(hex) {
        hex = this.expandHexShortToFull(hex);
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);
        rgb.r = r;
        rgb.g = g;
        rgb.b = b;
        return [rgb.r, rgb.g, rgb.b];

    }

    //-------------------------------------------------------------------------------------------------------

    this.hexToRGBNormalized = function(hex) {
        hex = this.expandHexShortToFull(hex);      
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);       
        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);
        rgb.r = r;
        rgb.g = g;
        rgb.b = b;
        return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    }

    //-------------------------------------------------------------------------------------------------------

    function componentToHex(c) {
        // console.log("componentToHex called " + c);
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    //-------------------------------------------------------------------------------------------------------

    this.rgbComponentsToHex = function(r, g, b) {
        // console.log("rgbToHex called " + r + " " + g + " " + b);
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    };

    this.rgb2hex = function(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    //-------------------------------------------------------------------------------------------------------

    this.linearToSrgb = function(c) {
        var v = 0.0;
        if (c < 0.0031308) {
            if (c > 0.0)
                v = c * 12.92;
        } else {
            v = 1.055 * Math.pow(c, 1.0 / gamma) - 0.055;
        }
        return v;
    };

    //-------------------------------------------------------------------------------------------------------

    this.srgbToLinear = function(c) {
        var v = 0.0;
        if (c < 0.04045) {
            if (c >= 0.0)
                v = c * (1.0 / 12.92);
        } else {
            v = Math.pow((c + 0.055) * (1.0 / 1.055), gamma);
        }
        return v;
    };

    //-------------------------------------------------------------------------------------------------------


};