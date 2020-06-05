function SBJS_UIDigitalDigit(){
	var classScope = this;
	//a digital digit is made up of 7 sections
	//the object names can have a prefix
	this.sectionObjectsNamePrefix = "";
	//the object names also have a key , this is for when you have many digits , each needs its own key/index to differenciate from each other
	this.sectionObjectsKeyIndex = "";
	this.sections = [];
	this.setup = function(){
		for(var i=0;i<7;i++){
			var name = classScope.sectionObjectsNamePrefix+"_"+classScope.sectionObjectsKeyIndex+"_"+(i+1);	
			var ob = {};
			ob.name = name;	
			ob.active = false;
			classScope.sections.push(ob);
			
		}
	};

	this.display_none = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			ob.active = false;
		}
	
	};


	this.display_0 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 3){
				ob.active = false;
				
			}else{
				ob.active = true;
			}
		}
	
	};

	this.display_1 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 2 || i == 5){
				ob.active = true;
				
			}else{
				ob.active = false;
			}
		}
	
	};

	this.display_2 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 0 || i == 2 || i == 3 || i == 4 || i == 6){
				ob.active = true;			
			}else{
				ob.active = false;
			}
		}
	
	};

	this.display_3 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 0 || i == 2 || i == 3 || i == 5 || i == 6){
				ob.active = true;			
			}else{
				ob.active = false;
			}
		}
	
	};

	this.display_4 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 1 || i == 2 || i == 3 || i == 5){
				ob.active = true;			
			}else{
				ob.active = false;
			}
		}
	
	};

	this.display_5 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 0 || i == 1 || i == 3 || i == 5|| i == 6){
				ob.active = true;				
			}else{
				ob.active = false;
			}
		}
	
	};

	this.display_6 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 0 || i == 1 || i == 3|| i == 4 || i == 5|| i == 6){
				ob.active = true;			
			}else{
				ob.active = false;
			}
		}
	
	};

	this.display_7 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 0 || i == 2 || i == 5){
				ob.active = true;			
			}else{
				ob.active = false;
			}
		}
	
	};

	this.display_8 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];		
			ob.active = true;
		}
	
	};

	this.display_9 = function(){

		for(var i=0;i<7;i++){
			var ob = classScope.sections[i];
			if(i == 4){
				ob.active = false;
				
			}else{
				ob.active = true;
			}
		}
	
	};

};
