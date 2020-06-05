var SBJSCore = {};

SBJSCore.forceDataToArray = function(data) {
    var arr = [];
    if (Array.isArray(data)) {
        arr = data;
    } else {
        arr.push(data);
    }
    return arr;
};

SBJSCore.isTouchDevice= (function() {

    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

    var mq = function(query) {
        return window.matchMedia(query).matches;
    }

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }


    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}()) ;



SBJSCore.HTMLDomFactory = (function() {
   

    this.createDomObject = function(domObjectName) {
        return document.createElement(domObjectName);
    };

    this.createTextNode = function(domObject, textValue) {
        var t = document.createTextNode(textValue);
        domObject.appendChild(t);

    };

    this.setClassOrID = function(domObject, classNameorIdName, IDName, useUniqueGenerator) {

        //validate the classname is a class or id
        // first argument can be class or ID and it will map to correct property
        // if you want to set a class and an ID , then use argument 0 for class argument 1 for ID 
        // if you used argument 0 for an ID   , it sets it as argument 2 and clears argument 0
        // this will prevent both arguments being set as IDs by mistake.. First will just overwrite hte second


        if (classNameorIdName.indexOf("#") !== -1) {
            IDName = classNameorIdName;
            classNameorIdName = undefined;
        }

        if (classNameorIdName !== null && classNameorIdName !== undefined) {

            if (useUniqueGenerator !== null && useUniqueGenerator !== undefined && useUniqueGenerator !== "false") {
                this.appendClass(domObject, this.uniqueSelectorGenerator(classNameorIdName));
            } else {
                this.appendClass(domObject, classNameorIdName);
            }
        }

        if (IDName !== null && IDName !== undefined) {
            if (useUniqueGenerator !== null && useUniqueGenerator !== undefined && useUniqueGenerator !== "false") {
                domObject.id = this.uniqueSelectorGenerator(IDName);
            } else {
                domObject.id = IDName;
            }
        }

    };

    this.appendClass = function(domObject, className) {
        $(domObject).addClass(className);
    };

    this.removeClass = function(domObject, className) {
        $(domObject).removeClass(className);
    };

    this.setStyleAttributes = function(domObject, styleObject) {
        for (var prop in styleObject) {
            domObject.style[prop] = styleObject[prop];
        }
    };

    this.setElementAttributes = function(domObject, elementAttributeObject) {
        for (var prop in elementAttributeObject) {
            domObject.setAttribute(prop, elementAttributeObject[prop]);
        }
    };



    this.uniqueSelectorGenerator = function(prefix) {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (prefix + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()));
    };

    return this;

}());



//EVENT DISPATCHER-----------------------------------------------------------------------------------------------------------------------------

SBJSCore.UIItemEventDispatcher = function() {
    //OBJECTS / STORAGE ----------------------------------------------------------------------------------------------------------------------  
    this.eventListeners = {};
   
   
};

SBJSCore.UIItemEventDispatcher.prototype = {
    EVENT_DOM_CLICK:"click",
    EVENT_DOM_MOUSE_DOWN:"mousedown",
    EVENT_DOM_MOUSE_UP:"mouseup",
    EVENT_DOM_MOUSE_MOVE:"mousemove",
    EVENT_DOM_CHANGE:"change",   
    EVENT_RESIZE:"resize",
    EVENT_COMPLETE:"complete",

    EVENT_INVALIDATE_TIER_1:"invalidatetier1",
    EVENT_INVALIDATE_TIER_2:"invalidatetier2",
    EVENT_INVALIDATE_TIER_3:"invalidatetier3",
    EVENT_UPDATE_HILIGHTS:"updatehilights",

    addEventListener: function(event, func, data) {

        if (this.eventListeners[event] === null || this.eventListeners[event] === undefined) {
            this.eventListeners[event] = [];

        }
        var ob = {};
        ob.func = func;
        ob.data = data;
        this.eventListeners[event].push(ob);
    },
    removeEventListener: function(event, func) {
        if (this.eventListeners[event] !== null) {
            for (var i = this.eventListeners[event].length - 1; i >= 0; i--) {
                if (this.eventListeners[event][i].func == func) {
                    this.eventListeners[event].splice(i, 1);
                }
            }
            if (this.eventListeners[event].length === 0) {
                this.eventListeners[event] = null;

            }
        }
    },
    dispatchEvent: function(eventName, eventObject) {

        var eventArray = this.eventListeners[eventName];
        if (eventArray !== null && eventArray !== undefined) {

            for (var i = 0; i < eventArray.length; i++) {
                if(eventArray[i].data !== null && eventArray[i].data !== undefined){
                    eventObject.data = eventArray[i].data;
                }               
                eventArray[i].func(eventObject);
            }
        }
    }
};

