$( document ).ready(function() {
   $("#dialog_content").perfectScrollbar();

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

    window.addEventListener('data-ready', function(e) {
        if(e.detail.ready) {
            room.$.slider_dataset.chevronRight(true);
            room.$.dataset_selection.$.selected_url.invalid = false;
        }
        else
            room.$.dataset_selection.$.selected_url.invalid = true;

        room.$.dataset_selection.showDatasetInfo();
    });

    window.addEventListener('select-dataset-controllet_data-url', function(e){
        room.$.slider_dataset.chevronRight(false);
        room.$.select_data_controllet.dataUrl = e.detail.url;
        room.$.select_data_controllet.init();
    });

    window.addEventListener('select-fields-controllet_selected-fields', function(e){
        room.selectedDatasetFields = room.$.select_data_controllet.getSelectedFields();
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

    setTimeout(function(){
        room.$.datalets_slider.setDatalets(COCREATION.datalets);
        room.$.info_list_controllet.setInfo(COCREATION.info);
    },1000);
});

room.splitScreenActive    = false;
room.library_tab_selected = 0;

room._library_tab_clicked = function(e){
    room.library_tab_selected = e.currentTarget.id;
};

room.handleSelectUIMode = function(mode){
    switch(mode){
        case 'explore':
            room.$.explore.style.display  = "block";
            room.$.ideas.style.display    = 'none';
            room.$.outcome.style.display  = 'none';
            room.$.library.style.display  = 'none';
            room.$.info.style.display     = 'none';
            if(!room.splitScreenActive) room.$.datalets.style.display = 'none';
            break;
        case 'ideas':
            room.$.explore.style.display  = "none";
            room.$.ideas.style.display    = 'block';
            room.$.outcome.style.display  = 'none';
            room.$.library.style.display  = 'none';
            room.$.info.style.display     = 'none';
            if(!room.splitScreenActive) room.$.datalets.style.display = 'none';
            break;
        case 'outcome':
            room.$.explore.style.display  = "none";
            room.$.ideas.style.display    = 'none';
            room.$.outcome.style.display  = 'block';
            room.$.library.style.display  = 'none';
            room.$.info.style.display     = 'none';
            if(!room.splitScreenActive) room.$.datalets.style.display = 'none';
            break;
        case 'library':
            room.$.explore.style.display  = "none";
            room.$.ideas.style.display    = 'none';
            room.$.outcome.style.display  = 'none';
            room.$.library.style.display  = 'block';
            room.$.datalets.style.display = 'none';
            room.$.info.style.display     = 'none';
            break;
        case 'datalets':
            room.$.explore.style.display  = "none";
            room.$.ideas.style.display    = 'none';
            room.$.outcome.style.display  = 'none';
            room.$.library.style.display  = 'none';
            room.$.datalets.style.display = 'block';
            room.$.info.style.display     = 'none';
            room.$.datalets_slider._refresh();
            break;
        case 'info':
            room.$.explore.style.display  = "none";
            room.$.ideas.style.display    = 'none';
            room.$.outcome.style.display  = 'none';
            room.$.library.style.display  = 'none';
            room.$.info.style.display     = 'block';
            if(!room.splitScreenActive) room.$.datalets.style.display = 'none';
            break;
    }

};

room.handleSplitScreen = function(e){
    room.splitScreenActive  = !e.checked;
    if(room.splitScreenActive){//active split screen

        room.$.library_menu_item.disabled = true;
        room.$.explore_menu_item.disabled = true;
        room.$.info_menu_item.disabled    = true;

        room.$.explore.style.display  = "block";
        room.$.ideas.style.display    = 'none';
        room.$.outcome.style.display  = 'none';
        room.$.library.style.display  = 'none';
        room.$.datalets.style.display = 'block';
        room.$.info.style.display     = 'none';

        $(room.$.datalets).addClass("split_size_card_right");
        $(room.$.explore).addClass("split_size_card_left");
        $(room.$.ideas).addClass("split_size_card_left");
        $(room.$.outcome).addClass("split_size_card_left");
    }else{
        room.$.library_menu_item.disabled = false;
        room.$.explore_menu_item.disabled = false;
        room.$.info_menu_item.disabled    = false;

        $(room.$.datalets).removeClass("split_size_card_right");
        $(room.$.explore).removeClass("split_size_card_left");
        $(room.$.ideas).removeClass("split_size_card_left");
        $(room.$.outcome).removeClass("split_size_card_left");
        room.handleSelectUIMode('explore');
    }
};


room._addDataset = function(){
        previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_AddDatasetForm', {}, {
            width: '70%',
            height: '40vh',
            iconClass: 'ow_ic_add',
            title: ''
        });
};

room.loadDatasetsLibrary = function() {
    $.post(OW.ajaxComponentLoaderRsp + "?cmpClass=COCREATION_CMP_DatasetsLibrary",
        {params: "[\"" + COCREATION.roomId + "\"]"},
        function (data, status) {
            data = JSON.parse(data);
            //onloadScript
            var onload = document.createElement('script');
            onload.setAttribute("type","text/javascript");
            onload.innerHTML = data.onloadScript;

            $('#dataset_library').html(data.content);
            previewFloatBox.close();
            room.$.library_tab.library_tab_selected = 0;
            room.$.library_tab_selected             = 0;
            OW.info(OW.getLanguageText('cocreation', 'dataset_successfully_added'));
        });
};

room.refreshDatasets = function(){
    $.post(ODE.ajax_coocreation_room_get_datasets, {} ,
        function(data){
            data = JSON.parse(data);
            SPODPUBLICROOM.suggested_datasets = data.suggested_datasets;
        });
};

/*
 room.selectedMode            = 1;
 room.selectedTab_cocreation  = 0;
 room.selectedTab_data        = 0;
 room.selectedDatasetFields   = [];
 room.cc_mode                 = "cc_mode_1";
 room.cc_selected_mode        = "";

 room._tabClicked_cocreation = function(e){
 var last_selected_doc = $("#doc" + room.selectedTab_cocreation);
 var new_selected_doc  = $("#doc" + e.currentTarget.id);
 var all_docs          = $("paper-material[id^='doc']");
 //update selection
 room.selectedTab_cocreation = e.currentTarget.id;
 //do document switching logic
 last_selected_doc.removeClass("visible_doc");
 all_docs.addClass("hidden_doc");
 new_selected_doc.removeClass("hidden_doc");
 new_selected_doc.addClass("visible_doc");
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
 };*/
/*
 room._handleCcModeClick = function(e){
 if(e.currentTarget.id == room.cc_mode) return;
 room.cc_mode = e.currentTarget.id;

 var datalets_slider_container = $("#datalets_slider_container");
 var cc_mode_0_button          = $("#cc_mode_0");
 var cc_mode_1_button          = $("#cc_mode_1");
 var cc_mode_2_button          = $("#cc_mode_2");
 var postit_window             = $(".postitwindow");
 var shared_docs_container     = $("#shared_docs");

 datalets_slider_container.toggle('blind',
 { direction: 'top'},
 function(){
 switch(room.cc_mode) {
 case "cc_mode_0":
 datalets_slider_container.css('display', 'none');
 shared_docs_container.css('display', 'block');
 shared_docs_container.css('width', '100%');

 cc_mode_1_button.css('background-color', '#B6B6B6');
 cc_mode_2_button.css('background-color', '#B6B6B6');
 cc_mode_0_button.css('background-color', '#00BCD4');
 break;
 case "cc_mode_1":
 shared_docs_container.css('display', 'block');
 datalets_slider_container.css('display', 'block');
 datalets_slider_container.css('width', '50%');
 shared_docs_container.css('width', '50%');

 cc_mode_0_button.css('background-color', '#B6B6B6');
 cc_mode_2_button.css('background-color', '#B6B6B6');
 cc_mode_1_button.css('background-color', '#00BCD4');
 postit_window.css('width', '50%');
 postit_window.css('left', '50%');
 break;
 case 'cc_mode_2':
 datalets_slider_container.css('width', '100%');
 datalets_slider_container.css('display', 'block');
 shared_docs_container.css('display', 'none');
 cc_mode_0_button.css('background-color', '#B6B6B6');
 cc_mode_1_button.css('background-color', '#B6B6B6');
 cc_mode_2_button.css('background-color', '#00BCD4');
 postit_window.css('width', '100%');
 postit_window.css('left', '0%');
 break;
 }
 },
 500);
 }*/