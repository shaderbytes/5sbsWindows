function SketchfabAPIUNodesModuleInspector() {


    //INHERITANCE -----------------------------------------------------------------------------------------------------------------------------
    ExpansionComponent.call(this);
    SketchfabAPIUNodesModuleInspector.prototype = Object.create(ExpansionComponent.prototype);

    //REFERENCES -----------------------------------------------------------------------------------------------------------------------------
    var classScope = this;
    var target;    
    var inspectorMain;   
    var selectionLists = {};
    var objectSelectionSection;
    var objectFunctionSection;
    var moduleFunctionSection;
    var selectionController;
    var nodeTypeList;
    var filterList;

    //object for module functions
    var setNodeVisibilityAll = {};
    //BOOLEANS--------------------------------------------------------------------------------------------------------------------------------
    this.moduleReady = false;  
    //----------------------------------------------------------------------------------------------------------------------------------------  

    this.key = "nodes";

    this.create = function (targetRef, inspectorMainRef) {
    target = targetRef;
    inspectorMain = inspectorMainRef;
       

    //add controller 
    selectionController = new UISelectionsController();

    //create expansion ------------

    // classScope.containerClassName = "SAPIUInspectorContainer";
    classScope.headClassName = "SAPIUInspectorHead2";
    classScope.contentClassName = "SAPIUInspectorModuleContent";
    classScope.label = classScope.key.toUpperCase();
    
    classScope.createExpansionComponent(selectionController);
    classScope.UISelectionItemHead.selectedIcon = "shaderbytes/images/magnify_minus.svg";
    classScope.UISelectionItemHead.deselectedIcon = "shaderbytes/images/magnify_plus.svg";
    var selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
    selectionGroup.triggerDeselect = true;
    classScope.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    inspectorMain.contentJQ[0].appendChild(classScope.containerJQ[0]);

    //add interaction listener     
    classScope.containerJQ.on("click touch", "." + selectionController.UID, selectionController.onInteraction);

    //----------------------------
    /*
        
    classScope.moduleFunctionSection = new ExpansionComponent();
    classScope.moduleFunctionSection.containerClassName = "SAPIUInspectorModulesHeaderContainer";
    classScope.moduleFunctionSection.contentClassName = "SAPIUInspectorModuleContent";
    classScope.moduleFunctionSection.headClassName = "SAPIUSubHeader";
    classScope.moduleFunctionSection.label = "Module Functions";
   
    classScope.moduleFunctionSection.createExpansionComponent(selectionController);
     classScope.moduleFunctionSection.UISelectionItemHead.selectedIcon = "shaderbytes/images/chevron-up.svg";
    classScope.moduleFunctionSection.UISelectionItemHead.deselectedIcon = "shaderbytes/images/chevron-down.svg";
    selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
       selectionGroup.triggerDeselect = true;
    classScope.moduleFunctionSection.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    classScope.contentJQ[0].appendChild(classScope.moduleFunctionSection.containerJQ[0]);

    classScope.objectSelectionSection = new ExpansionComponent();
    classScope.objectSelectionSection.containerClassName = "SAPIUInspectorModulesHeaderContainer";
    classScope.objectSelectionSection.contentClassName = "SAPIUInspectorModuleContent";
    classScope.objectSelectionSection.headClassName = "SAPIUSubHeader";
    classScope.objectSelectionSection.label = "Object Selection";
  
    classScope.objectSelectionSection.createExpansionComponent(selectionController);
      classScope.objectSelectionSection.UISelectionItemHead.selectedIcon = "shaderbytes/images/chevron-up.svg";
    classScope.objectSelectionSection.UISelectionItemHead.deselectedIcon = "shaderbytes/images/chevron-down.svg";
    selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
       selectionGroup.triggerDeselect = true;
    classScope.objectSelectionSection.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    classScope.contentJQ[0].appendChild(classScope.objectSelectionSection.containerJQ[0]);

    classScope.objectFunctionSection = new ExpansionComponent();
    classScope.objectFunctionSection.containerClassName = "SAPIUInspectorModulesHeaderContainer";
    classScope.objectFunctionSection.contentClassName = "SAPIUInspectorModuleContent";
    classScope.objectFunctionSection.headClassName = "SAPIUSubHeader";
    classScope.objectFunctionSection.label = "Object Functions";
  
    classScope.objectFunctionSection.createExpansionComponent(selectionController);
      classScope.objectFunctionSection.UISelectionItemHead.selectedIcon = "shaderbytes/images/chevron-up.svg";
    classScope.objectFunctionSection.UISelectionItemHead.deselectedIcon = "shaderbytes/images/chevron-down.svg";
    selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
       selectionGroup.triggerDeselect = true;
    classScope.objectFunctionSection.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    classScope.contentJQ[0].appendChild(classScope.objectFunctionSection.containerJQ[0]);

       
    //build node storage selection lists
    var selectionGroupObjects = new UISelectionGroup();
       
      
    for (var prop in target.nodeHash) {
        var SI;
        var nt = new ExpansionComponent();
        nt.headClassName = "SAPIUInspectorHead3";
        nt.contentClassName = "SAPIUInspectorModuleContent";
        nt.label = prop;
       
        nt.createExpansionComponent(selectionController);
         nt.UISelectionItemHead.selectedIcon = "shaderbytes/images/magnify_minus.svg";
        nt.UISelectionItemHead.deselectedIcon = "shaderbytes/images/magnify_plus.svg";
        selectionGroup = new UISelectionGroup();
        selectionGroup.deselectSelf = true;
           selectionGroup.triggerDeselect = true;
        nt.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
           

        var storage = target.nodeHash[prop];
        var hasProp = false;
          
        for (var prop2 in storage) {
            hasProp = true
            SI = new UISelectionItem();
            if (!target.validateNodeName(prop2)) continue;
            var listChild = inspectorMain.domFactory.createDomObject("div");
            SI.createUISelectionItem(listChild);
            SI.assignToSelectionGroup(selectionGroupObjects);
            inspectorMain.domFactory.setClassOrID(listChild, "SAPIUInspectorListItem selectableNode");
            nt.contentJQ[0].appendChild(listChild);
            inspectorMain.domFactory.setElementAttributes(listChild, { "data-storagekey": prop, "data-key": prop2 });
            SI.onSelectedTrigger = classScope.onSelectListItem;
            var listChildP = inspectorMain.domFactory.createDomObject("p");
            inspectorMain.domFactory.createTextNode(listChildP, prop2);
            listChild.appendChild(listChildP);
            selectionController.registerUISelectionItem(SI);
                
            }
            //this is to not add a empty selection list.
            if (hasProp) {
                classScope.objectSelectionSection.contentJQ[0].appendChild(nt.containerJQ[0]);              

            }

    }

       

    //add module functions ----------------------------------------------------------------------------------------------------------------
        

    //setNodeVisibilityAll

    setNodeVisibilityAll = new ExpansionComponent();
    setNodeVisibilityAll.headClassName = "SAPIUInspectorHead3";
    setNodeVisibilityAll.contentClassName = "listChildContent";
    setNodeVisibilityAll.label = "setNodeVisibilityAll";    
    setNodeVisibilityAll.createExpansionComponent(selectionController);
    setNodeVisibilityAll.UISelectionItemHead.selectedIcon = "shaderbytes/images/magnify_minus.svg";
    setNodeVisibilityAll.UISelectionItemHead.deselectedIcon = "shaderbytes/images/magnify_plus.svg";
    selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
       selectionGroup.triggerDeselect = true;
    setNodeVisibilityAll.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    classScope.moduleFunctionSection.contentJQ[0].appendChild(setNodeVisibilityAll.containerJQ[0]);

        
    var arguments = new ExpansionComponent();
    arguments.headClassName = "argumentHeader containerRightIcon";
    arguments.contentClassName = "listChildContent";
    arguments.label = "ARGUMENTS";
   
    arguments.createExpansionComponent(selectionController);
     arguments.UISelectionItemHead.selectedIcon = "shaderbytes/images/chevron-up.svg";
    arguments.UISelectionItemHead.deselectedIcon = "shaderbytes/images/chevron-down.svg";
    selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
       selectionGroup.triggerDeselect = true;
    arguments.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    setNodeVisibilityAll.contentJQ[0].appendChild(arguments.containerJQ[0]);


    var functionApply = inspectorMain.domFactory.createDomObject("div");
    inspectorMain.domFactory.setClassOrID(functionApply, "SAPIUInspectorListButton");
    var functionApplyP = inspectorMain.domFactory.createDomObject("p");
    inspectorMain.domFactory.createTextNode(functionApplyP, "APPLY");
    functionApply.appendChild(functionApplyP);
    setNodeVisibilityAll.contentJQ[0].appendChild(functionApply);
    $(functionApply).on("click", function(e){
        var a3 = null;
        if(nodeTypeList.isExpanded){
            a3 = setNodeVisibilityAll.argument3;
        }
        var a2 = null;
        if(filterList.isExpanded && a3 !== null){
            a2= setNodeVisibilityAll.argument2;
        }
        target.setNodeVisibilityAll(setNodeVisibilityAll.argument1 ,a2,a3);
    });


    //--------------

   
    selectionGroup = new UISelectionGroup();
    selectionGroup.triggerDeselect = true;
    SI = new UISelectionItem();    
    var listChild = inspectorMain.domFactory.createDomObject("div");
   
    SI.createUISelectionItem(listChild);
    SI.assignToSelectionGroup(selectionGroup);
    SI.selectedIcon = "shaderbytes/images/disc.svg";
    SI.deselectedIcon = "shaderbytes/images/circle.svg";     
    inspectorMain.domFactory.setClassOrID(listChild, "SAPIUInspectorListItem containerRightIcon");
    arguments.contentJQ[0].appendChild(listChild);  
    
    SI.onSelectedTrigger =  function(classScopeRef){    
     setNodeVisibilityAll.argument1  = true;
     console.log("setNodeVisibilityAll.argument1 = "+setNodeVisibilityAll.argument1);
    };
    SI.onDeselectedTrigger =  function(classScopeRef){
     setNodeVisibilityAll.argument1  = false;
     console.log("setNodeVisibilityAll.argument1 = "+setNodeVisibilityAll.argument1);
    };
    var listChildP = inspectorMain.domFactory.createDomObject("p");
    inspectorMain.domFactory.createTextNode(listChildP,"\u2022 makeVisible");
    listChild.appendChild(listChildP);
    selectionController.registerUISelectionItem(SI);

   
    setNodeVisibilityAll.argument1 = false;


    nodeTypeList = new ExpansionComponent();
    nodeTypeList.headClassName = "containerRightIcon";
    nodeTypeList.contentClassName = "SAPIUInspectorModuleContent";
    nodeTypeList.label = "\u2022 [Node Types]";   
    nodeTypeList.createExpansionComponent(selectionController);
    nodeTypeList.UISelectionItemHead.selectedIcon = "shaderbytes/images/check-square.svg";
    nodeTypeList.UISelectionItemHead.deselectedIcon = "shaderbytes/images/x-square.svg";   
    selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
       selectionGroup.triggerDeselect = true;
    nodeTypeList.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    arguments.contentJQ[0].appendChild(nodeTypeList.containerJQ[0]);
       

    filterList = new ExpansionComponent();
    filterList.headClassName = "argumentTitleOptional";
    filterList.contentClassName = "SAPIUInspectorModuleContent";
    filterList.label = "\u2022 [nodes of Type]";   
    filterList.createExpansionComponent(selectionController);
    filterList.UISelectionItemHead.selectedIcon = "shaderbytes/images/check-square.svg";
    filterList.UISelectionItemHead.deselectedIcon = "shaderbytes/images/x-square.svg";  
    selectionGroup = new UISelectionGroup();
    selectionGroup.deselectSelf = true;
       selectionGroup.triggerDeselect = true;
    filterList.UISelectionItemHead.assignToSelectionGroup(selectionGroup);
    arguments.contentJQ[0].appendChild(filterList.containerJQ[0]);
       
        
      
    selectionGroup = new UISelectionGroup();
    var index = 0;
    for (var prop in target.nodeHash) {
          
        SI = new UISelectionItem();
        SI.index = index;
        var listChild = inspectorMain.domFactory.createDomObject("div");
        SI.createUISelectionItem(listChild);
        SI.assignToSelectionGroup(selectionGroup);
        SI.updateUISelected = classScope.updateUISelected_1;
        SI.updateUIDeselected = classScope.updateUIDeselected_1;          
        inspectorMain.domFactory.setClassOrID(listChild, "SAPIUInspectorListItem selectableNode2");
        nodeTypeList.contentJQ[0].appendChild(listChild);
        inspectorMain.domFactory.setElementAttributes(listChild, { "data-storagekey": prop });
        SI.onSelectedTrigger = classScope.onSelectListItem2;
        var listChildP = inspectorMain.domFactory.createDomObject("p");
        inspectorMain.domFactory.createTextNode(listChildP, prop);
        listChild.appendChild(listChildP);
        selectionController.registerUISelectionItem(SI);
        if(prop == "MatrixTransform"){            
            SI.onInteraction({currentTarget:SI.targetDOM});
        }
        index++;

    }

       





    //--------------
    this.buildNodeFunctions = function(){
    
    }
    

    //-------------------------------------------------------------------------------------------------------------------------------------     

    //  classScope.contentJQ.on("click", ".selectableNode", classScope.onSelectListItem);
    moduleReady = true;
    };

    //-----------------------------------------------------------------------------------------------------------------

    this.onFilterVisibleSelection = function (classScopeRef){
        setNodeVisibilityAll.argument2 = classScope.toArray(classScopeRef.selectionGroup.itemsSelectedCurrent);
    };

    //-----------------------------------------------------------------------------------------------------------------


    this.toArray = function(ob){
        var a = [];
        for(var prop in ob){
            a.push(ob[prop].label);
        }
        return a;
    };

    //-----------------------------------------------------------------------------------------------------------------

    this.onSelectListItem = function (classScopeRef) {
        var e = classScopeRef.mouseEventLatest;
        var key = e.currentTarget.dataset.key;
        var storagekey = e.currentTarget.dataset.storagekey;
        var node = target.getObject(key, null, storagekey);
        console.log(node);

    };

    this.onSelectListItem2 = function (classScopeRef) {    
        var e = classScopeRef.mouseEventLatest;
        var storagekey = e.currentTarget.dataset.storagekey; 
        setNodeVisibilityAll.argument3 = storagekey;
        console.log(storagekey);
        filterList.contentJQ[0].innerHTML = "";
        var selectionGroup = new UISelectionGroup();
        selectionGroup.multiSelect = true;
        selectionGroup.triggerDeselect = true;
        var index = 0;
        for (var prop in target.nodeHash[storagekey]) {
            if (!target.validateNodeName(prop)) continue;
            SI = new UISelectionItem();
            SI.index = index;
            var listChild = inspectorMain.domFactory.createDomObject("div");
            SI.createUISelectionItem(listChild);
            SI.assignToSelectionGroup(selectionGroup);
            SI.updateUISelected = classScope.updateUISelected_1;
            SI.updateUIDeselected = classScope.updateUIDeselected_1b;
            SI.onSelectedTrigger = classScope.onFilterVisibleSelection;
            SI.onDeselectedTrigger = classScope.onFilterVisibleSelection;
            inspectorMain.domFactory.setClassOrID(listChild, "SAPIUInspectorListItem");
            filterList.contentJQ[0].appendChild(listChild);
            inspectorMain.domFactory.setElementAttributes(listChild, { "data-storagekey": prop });           
            var listChildP = inspectorMain.domFactory.createDomObject("p");
            inspectorMain.domFactory.createTextNode(listChildP, prop);
            SI.label = prop;
            listChild.appendChild(listChildP);
            selectionController.registerUISelectionItem(SI);
            index++;

        }

    };

   
    this.updateUISelected_1 = function(classScopeRef){
        classScopeRef.targetDOMJQ.css("backgroundColor","#ffd494");
    };
   
    //for single select
    this.updateUIDeselected_1 = function(classScopeRef){
        classScopeRef.selectionGroup.itemSelectedCurrent.targetDOMJQ.css("backgroundColor","");
    
    };

    //for multiselect
    this.updateUIDeselected_1b = function(classScopeRef){
        classScopeRef.targetDOMJQ.css("backgroundColor","");
    
    };

   */

    this.invalidate = function () {
        if (!moduleReady) {
            console.error("invalidate called in SketchfabAPIUNodesInspectorModule but moduleReady is false , meaning its 'create' function has never been called ");
        }
    }
}