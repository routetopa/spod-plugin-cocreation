$( document ).ready(function() {
   $("#grid-container").perfectScrollbar();
   $("#dialog_content").perfectScrollbar();
   $("#dataset-grid-container").perfectScrollbar();

   window.addEventListener('page-slider-controllet_selected', function(e){
        ln["localization"] = "en";

        if(e.srcElement.id == "slider_dataset") {
            switch (e.detail.selected) {
                case 0:
                    room.$.slider_dataset.setTitle(ln["slide1Title_" + ln["localization"]], ln["slide1Subtitle_" + ln["localization"]]);
                    room.$.slider_dataset.chevronLeft("invisible");
                    room.$.slider_dataset.chevronRight(true);
                    break;
                case 1:
                    room.$.slider_dataset.setTitle(ln["slide2Title_" + ln["localization"]], ln["slide2Subtitle_" + ln["localization"]]);
                    room.$.slider_dataset.chevronLeft(true);
                    room.$.slider_dataset.chevronRight("invisible");
                    break;
            }
        }
    });

    window.addEventListener('dataset-selection-controllet_data-url', function(e){
        $("#pass_2_select_data_container").html('<select-data-controllet id="select_data_controllet" data-url=' + e.detail.url + '></select-data-controllet>');
    });

    window.addEventListener('tree-view-controllet_selected-fields', function(e){
        room.selectedDatasetFields = e.detail.fields;
    });

    window.addEventListener('create_dataset_form-form_submitted', function(e){
        if(room.selectedDatasetFields.length > 0) {
            $.post(ODE.ajax_coocreation_room_add_dataset,
                {
                    dataUrl: room.$.dataset_selection.dataUrl,
                    datasetName: e.detail.name,
                    datasetDescription: e.detail.description,
                    datasetFields: JSON.stringify(room.selectedDatasetFields)
                },
                function (data, status) {
                    data = JSON.parse(data);
                    if (data.status == "ok") {
                        previewFloatBox.close();
                    }else{
                        OW.info(OW.getLanguageText('cocreation', 'dataset_add_fail'));
                    }
                }
            );
        }else{
            OW.info(OW.getLanguageText('cocreation', 'dataset_fields_empty'));
        }
    });

    room.loadDataletsSlider();
});

room.selectedMode            = 1;
room.selectedTab_cocreation  = 0;
room.selectedTab_data        = 0;
room.selectedDatasetFields   = [];
room.cc_mode                 = "cc_mode_1";
room.cc_selected_mode        = "";

room._tabClicked_cocreation = function(e){
    room.selectedTab_cocreation = e.currentTarget.id;
};

room._tabClicked_data = function(e){
    room.selectedTab_data = e.currentTarget.id;
};

room._onModeChange = function(e){
    room.selectedMode = e.currentTarget.id;
    switch(room.selectedMode){
        case "0" :
            $("#mode").html(OW.getLanguageText('cocreation', 'room_menu_data'));
            $("#addDatalet").css('display', 'none');
            $("#cocreation_view_modes").css('display', 'none');
            break;
        case "1":
            $("#mode").html(OW.getLanguageText('cocreation', 'room_menu_cocreation'));
            $("#addDatalet").css('display', 'block');
            $("#cocreation_view_modes").css('display', 'flex');
            break;
        case "2":
            $("#mode").html(OW.getLanguageText('cocreation', 'room_menu_tools'));
            $("#addDatalet").css('display', 'none');
            $("#cocreation_view_modes").css('display', 'none');
            break;
    }
};


room._addDataset = function(){
        previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_AddDatasetForm', {}, {
            width: '70%',
            height: '40vh',
            iconClass: 'ow_ic_add',
            title: ''
        });
}

room._handleCcModeClick = function(e){
    room.cc_mode = e.currentTarget.id;
    switch(e.currentTarget.id) {
        case "cc_mode_0":
            if(room.cc_selected_mode == "cc_mode_0") break;
            $("#datalets_slider_container").toggle('blind',
                   { direction: 'top'},
                     function(){
                         $("#datalets_slider_container").css('display', 'none');
                         $("#shared_docs").css('width', '100%');
                    },
                500);
            $("#cc_mode_1").css('background-color', '#B6B6B6');
            $("#cc_mode_2").css('background-color', '#B6B6B6');
            $(e.currentTarget).css('background-color', '#00BCD4');
            room.cc_selected_mode = "cc_mode_0";
            break;
        case "cc_mode_1":
            if(room.cc_selected_mode == "cc_mode_1") break;
            $("#datalets_slider_container").toggle('blind',
                { direction: 'top'},
                function(){
                    $("#datalets_slider_container").css('width', '50%');
                    $("#datalets_slider_container").css('display', 'block');
                    $("#shared_docs").css('width', '50%');
                },
                500);
            $("#cc_mode_0").css('background-color', '#B6B6B6');
            $("#cc_mode_2").css('background-color', '#B6B6B6');
            $(".postitwindow").css('width', '50%');
            $(".postitwindow").css('left', '50%');
            $(e.currentTarget).css('background-color', '#00BCD4');
            room.cc_selected_mode = "cc_mode_1";
            break;
        case "cc_mode_2":
            if(room.cc_selected_mode == "cc_mode_2") break;
            $("#datalets_slider_container").toggle('blind',
                { direction: 'top'},
                function(){
                    $("#datalets_slider_container").css('width', '100%');
                    $("#datalets_slider_container").css('display', 'block');
                    $("#shared_docs").css('width', '0px');
                },
                500);
            $("#cc_mode_0").css('background-color', '#B6B6B6');
            $("#cc_mode_1").css('background-color', '#B6B6B6');
            $(".postitwindow").css('width', '100%');
            $(".postitwindow").css('left', '0%');
            $(e.currentTarget).css('background-color', '#00BCD4');
            room.cc_selected_mode = "cc_mode_2";
            break;
    }
}

room.loadDatasetsLibrary = function() {
    $.post(OW.ajaxComponentLoaderRsp + "?cmpClass=COCREATION_CMP_DatasetsLibrary",
        {params: "[\"" + COCREATION.roomId + "\"]"},
        function (data, status) {
            data = JSON.parse(data);
            //onloadScript
            var onload = document.createElement('script');
            onload.setAttribute("type","text/javascript");
            onload.innerHTML = data.onloadScript;

            $('#data_library').html(data.content);
            previewFloatBox.close();
            room.$.slider_dataset.selected = 0;
            room.selectedTab_data          = 2;
            OW.info(OW.getLanguageText('cocreationep', 'dataset_successful_added'));
        });
}

room.refreshDatasets = function(){
    $.post(ODE.ajax_coocreation_room_get_datasets, {} ,
        function(data){
            data = JSON.parse(data);
            SPODPUBLICROOM.suggested_datasets = data.suggested_datasets;
        });
}

/*room.loadDataletsSlider = function(){
 $.post(OW.ajaxComponentLoaderRsp + "?cmpClass=COCREATION_CMP_DataletsSlider",
 {params: "[\"" + COCREATION.roomId + "\"]"},
 function (data, status) {
 data = JSON.parse(data);
 //onloadScript
 var onload = document.createElement('script');
 onload.setAttribute("type","text/javascript");
 onload.innerHTML = data.onloadScript;
 //script files
 $('#datalets_slider_container').html(data.content);
 $('#addDatalet').click(function(){room._addDatalet()});

 var event = new CustomEvent('page-slider-controllet_selected',{ detail : {'selected' : ODE.numDataletsInCocreationRooom - 1 }});
 window.dispatchEvent(event);

 room.sliderRefreshCurrentDatalet();
 });
 }


 room.inviteNewUsers = function(){
 previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_AddMembers', { roomId : window.location.pathname.split("/")[window.location.pathname.split("/").length - 1]}, {
 width: '40%',
 height: '30vh',
 iconClass: 'ow_ic_add',
 title: ''
 });
 }

room.init = function(){
    var socket = io("http://" + window.location.hostname +":3000");
    socket.on('realtime_message_' + COCREATION.entity_type + "_" + COCREATION.roomId, function(rawData) {
        switch(rawData.operation){
            case "addDatasetToRoom":
                room.loadDatasetsLibrary();
                room.$.syncMessage.innerHTML = "New dataset has been added ro this room";
                room.$.syncToast.show();
                break;
            case "addDataletToRoom":
                room.loadDataletsSlider();
                room.$.syncMessage.innerHTML = "New datalet has been added ro this room";
                room.$.syncToast.show();
                break;
            case "addPostitToDatalet":
                room._handleCcModeClick({currentTarget : {id : room.cc_mode}});
                room.$.syncMessage.innerHTML = "New postit has been added ro this room";
                room.$.syncToast.show();
                break;
        }
    });
}*/
