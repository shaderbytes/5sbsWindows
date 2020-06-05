var SBJS_AJAXCore = {};


SBJS_AJAXCore.loadQueueItem = function(){
this.url = "";
this.complete = false;
this.storageTarget;
this.scope;

}

SBJS_AJAXCore.XMLLoader = function(){
    SBJSCore.UIItemEventDispatcher.call(this);
	this.loadQueue = [];
	this.xhttp = new XMLHttpRequest();       
       
    this.xhttp.onreadystatechange  = this.onreadystatechange.bind(this);	
	

};

SBJS_AJAXCore.XMLLoader.prototype = {
	addItemToLoad:function(url,storageTargetRef,scopeRef){
		var item = new SBJS_AJAXCore.loadQueueItem();
		item.url = url;
		item.storageTarget  = storageTargetRef;
		item.scope  = scopeRef;
		this.loadQueue.push(item);
		

	},
	startLoading:function(){
		this.processLoadQueue();
	},
	processLoadQueue:function(){
  
		if(this.loadQueue.length> 0){
			this.xhttp.open("GET", this.loadQueue[0].url, true);
            this.xhttp.send();
		}else{
		    //all items loaded;
           
            this.dispatchEvent(this.EVENT_COMPLETE,this);
		}
	
	},
	onreadystatechange:function(){

		if (this.xhttp.readyState === 4 && this.xhttp.status === 200) {               
                        
            var item = this.loadQueue[0]; 
			var data  = item.scope[item.storageTarget] = this.parseXml(this.xhttp); 
            item.scope[data.ROOT.BUILD_TARGET.nodeValue](data);
            this.loadQueue.shift();
			this.processLoadQueue();             
               
        }
	
	},


	parseXml :function (xml) {       
        var dom = null;
        if (window.DOMParser) {
            dom = (new DOMParser()).parseFromString(xml.responseText, "text/xml");
        }
        else if (window.ActiveXObject) {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml)) {
                throw dom.parseError.reason + " " + dom.parseError.srcText;
            }
        }
        else {
            throw "cannot parse xml string!";
        }



        function parseNode(xmlNode, result, oldresult) {


            if (xmlNode.nodeName == "#comment") return;

            if (xmlNode.nodeName == "#text" || xmlNode.nodeName == "#cdata-section") {
                var v = xmlNode.nodeValue;
                if (v.trim()) {
                    result['nodeValue'] = v;
                }
                return;
            }
            var jsonNode = {};
            var key = xmlNode.getAttribute("key");
            var KeyOrNodeName = key || xmlNode.nodeName;
            var length = xmlNode.childNodes.length;


            if (result[KeyOrNodeName] !== null && result[KeyOrNodeName] !== undefined) {
                if (!Array.isArray(result[KeyOrNodeName])) {
                    var temp = result[KeyOrNodeName];
                    result[KeyOrNodeName] = [];
                    result[KeyOrNodeName].push(temp);
                }
                result[KeyOrNodeName].push(jsonNode);

            } else {
                jsonNode = result[KeyOrNodeName] = {};

            }


            if (xmlNode.attributes) {
                var length = xmlNode.attributes.length;
                for (var i = 0; i < length; i++) {
                    var attribute = xmlNode.attributes[i];
                    if (attribute.nodeName !== "key") {
                        jsonNode[attribute.nodeName] = attribute.nodeValue;
                    }
                }
            }

           

            var length = xmlNode.childNodes.length;
            for (var i = 0; i < length; i++) {
                parseNode(xmlNode.childNodes[i], jsonNode);
            }
        }

        var result = {};
        for (let i = 0; i < dom.childNodes.length; i++) {
            parseNode(dom.childNodes[i], result);
        }
       
          return result;

    }


};

var inherit_1 = Object.create(SBJSCore.UIItemEventDispatcher.prototype);
Object.assign(inherit_1, SBJS_AJAXCore.XMLLoader.prototype);
SBJS_AJAXCore.XMLLoader.prototype = inherit_1;


