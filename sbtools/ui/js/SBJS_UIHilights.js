

var SBJS_UIHilights = {};

SBJS_UIHilights.Hilight = function() {
  
  //values need to be set and changed via themes
  var value1 = "#0199ff";
  var value2 = "#eee";
   
    

};

SBJS_UIHilights.Hilight.prototype =  {


    action1:function(item){  
         if (item.isSelected) {
            item.domElementContentJQ.css("background-color", this.value1);
            if(item.uiitemLabel !== null && item.uiitemLabel !== undefined){
                item.uiitemLabel.domElementTextJQ.css("color", this.value2);
            }
           
        } else {
            item.domElementContentJQ.css("background-color", "");
            if(item.uiitemLabel !== null && item.uiitemLabel !== undefined){
                item.uiitemLabel.domElementTextJQ.css("color", "");
            }            
        }
    },
     action2:function(item){    
   
         if (item.isSelected) {
            item.domElementContentJQ.css("border", "2px solid "+this.value1);
            
           
        } else {
             item.domElementContentJQ.css("border", "");
                    
        }
    },   
     action3:function(item){    
    
         if (item.isSelected) {
            item.domElementContentJQ.css("border-bottom", "4px solid "+this.value1);
            
           
        } else {
             item.domElementContentJQ.css("border", "");
                    
        }
    },
    
    setTheme:function(data){
        data = SBJSCore.forceDataToArray(data);
        for(var i=0;i<data.length;i++){
            var t = data[i];
            this[t.VARIABLE.nodeValue] = t.VALUE.nodeValue;
        }
    
    }

};

SBJS_UIHilights.actions = new SBJS_UIHilights.Hilight();