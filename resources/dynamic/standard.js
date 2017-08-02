DomReady.ready(function() {
     
    var imageSelect = new ImageSelect({
        instanceId : '{%= CurrentADC.InstanceId%}',
        currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
		root : '#adc_{%= CurrentADC.InstanceId %}',
		target : 'jsObj{%= CurrentADC.InstanceId%}',
		width : 400,
		isSingle: {%= (CurrentQuestion.Type = "single") %},
		isMultiple: {%= (CurrentQuestion.Type = "multiple") %},
		maxWidth : '{%= CurrentADC.PropValue("maxWidth") %}',
		controlWidth : '{%= CurrentADC.PropValue("controlWidth") %}',
		controlAlign : '{%= CurrentADC.PropValue("controlAlign") %}',
		columns: {%= CurrentADC.PropValue("columns") %},
		maxImageWidth : {%= CurrentADC.PropValue("maxImageWidth") %},
		maxImageHeight : {%= CurrentADC.PropValue("maxImageHeight") %},
		forceImageSize : '{%= CurrentADC.PropValue("forceImageSize") %}',
		forcedResponseWidth : '{%= CurrentADC.PropValue("forcedResponseW") %}',
		forcedResponseHeight : '{%= CurrentADC.PropValue("forcedResponseH") %}',
		forceResponseSize : '{%= CurrentADC.PropValue("forceResponseSize") %}',
		autoForward: {%= (CurrentADC.PropValue("autoForward") = "1") %},
		numberNS: {%= CurrentADC.PropValue("numberNS") %},
		showResponseHoverColour: {%= (CurrentADC.PropValue("showResponseHoverColour") = "1") %},
		showResponseHoverFontColour: {%= (CurrentADC.PropValue("showResponseHoverFontColour") = "1") %},
		showResponseHoverBorder: {%= (CurrentADC.PropValue("showResponseHoverBorder") = "1") %},
		showResponseHoverShadow: {%= (CurrentADC.PropValue("showResponseHoverShadow") = "1") %},
      	currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
		items : [
			{% IF CurrentQuestion.Type = "single" Then %}
				{%:= CurrentADC.GetContent("dynamic/standard_single.js").ToText()%}
			{% ElseIf CurrentQuestion.Type = "multiple" Then %}
				{%:= CurrentADC.GetContent("dynamic/standard_multiple.js").ToText()%}
			{% EndIF %}
		]
	});
});