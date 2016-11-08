$( document ).ready(function() {

    window.addEventListener('datalet-slider-controllet_selected', function(e){
        room.$.postits_controllet.setPostits(COCREATION.postits[e.detail.dataletId], e.detail.dataletId);

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

    window.addEventListener('postit-container-controllet_create-new-postit', function(e){
        var dataletId = e.detail.id.replace("postit_","");
        $.post(ODE.ajax_coocreation_room_add_postit,
            {
                dataletId: dataletId,
                title: e.detail.title,
                content: e.detail.content
            },
            function (data, status) {
                data = JSON.parse(data);
                if (data.status == "ok") {
                }else{
                    OW.info(OW.getLanguageText('cocreation', 'postit_add_fail'));
                }
            }
        );
    });

    setTimeout(function(){
        room.$.datalets_slider.setDatalets(COCREATION.datalets);
        room.$.info_list_controllet.setInfo(COCREATION.info);
        room.$.postits_controllet.setPostits(COCREATION.postits[Object.keys(COCREATION.postits)[0]], Object.keys(COCREATION.postits)[0]);
    },1500);
});

room.splitScreenActive          = false;
room.library_tab_selected       = 0;
room.current_selected_container = null;
room.current_selected_document  = null;

room._library_tab_clicked = function(e){
    room.library_tab_selected = e.currentTarget.id;
};

room.handleSelectUIMode = function(mode){
    switch(mode){
        case 'explore':
            room.current_selected_document = room.$.explore;
            room.$.section_menu.selected   = 0;
            room.$.explore.style.display   = "block";
            room.$.ideas.style.display     = 'none';
            room.$.outcome.style.display   = 'none';
            room.$.library.style.display   = 'none';
            if(!room.splitScreenActive){
                room.$.datalets.style.display = 'none';
                room.$.info.style.display     = 'none';
            }
            break;
        case 'ideas':
            room.current_selected_document = room.$.ideas;
            room.$.section_menu.selected   = 1;
            room.$.explore.style.display   = "none";
            room.$.ideas.style.display     = 'block';
            room.$.outcome.style.display   = 'none';
            room.$.library.style.display   = 'none';
            if(!room.splitScreenActive){
                room.$.datalets.style.display = 'none';
                room.$.info.style.display     = 'none';
            }
            break;
        case 'outcome':
            room.current_selected_document = room.$.outcome;
            room.$.section_menu.selected   = 2;
            room.$.explore.style.display   = "none";
            room.$.ideas.style.display     = 'none';
            room.$.outcome.style.display   = 'block';
            room.$.library.style.display   = 'none';
            if(!room.splitScreenActive){
                room.$.datalets.style.display = 'none';
                room.$.info.style.display     = 'none';
            }
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
            room.current_selected_container = room.$.datalets;
            room.$.library.style.display  = 'none';
            room.$.datalets.style.display = 'block';
            room.$.info.style.display     = 'none';
            room.$.datalets_slider._refresh();
            if(!room.splitScreenActive){
                room.$.explore.style.display  = "none";
                room.$.ideas.style.display    = 'none';
                room.$.outcome.style.display  = 'none';
            }
            break;
        case 'info':
            room.current_selected_container = room.$.info;
            room.$.library.style.display  = 'none';
            room.$.info.style.display     = 'block';
            room.$.datalets.style.display = 'none';
            if(!room.splitScreenActive){
                room.$.explore.style.display  = "none";
                room.$.ideas.style.display    = 'none';
                room.$.outcome.style.display  = 'none';
            }
            break;
        case 'split':
            room.$.split_checkbox.checked = !room.$.split_checkbox.checked;
            room.handleSplitScreen(room.$.split_checkbox);
            break;
    }
};

room.handleSplitScreen = function(e){
    room.splitScreenActive  = e.checked;
    if(room.splitScreenActive){//active split screen

        room.$.library_menu_item.disabled = true;

        room.$.explore.style.display  = "none";
        room.$.ideas.style.display    = 'none';
        room.$.outcome.style.display  = 'none';
        room.$.library.style.display  = 'none';
        room.$.datalets.style.display = 'none';
        room.$.info.style.display     = 'none';

        if(room.current_selected_container == null){
            room.current_selected_container  = room.$.datalets;
            room.$.section_menu.selected     = 5;
        }
        room.current_selected_container.style.display = "block";

        if(room.current_selected_document == null) room.current_selected_document = room.$.explore;
        room.current_selected_document.style.display = "block";

        $(room.$.info).addClass("split_size_card_right");
        $(room.$.datalets).addClass("split_size_card_right");
        $(room.$.explore).addClass("split_size_card_left");
        $(room.$.ideas).addClass("split_size_card_left");
        $(room.$.outcome).addClass("split_size_card_left");
    }else{
        room.$.library_menu_item.disabled = false;

        $(room.$.info).removeClass("split_size_card_right");
        $(room.$.datalets).removeClass("split_size_card_right");
        $(room.$.explore).removeClass("split_size_card_left");
        $(room.$.ideas).removeClass("split_size_card_left");
        $(room.$.outcome).removeClass("split_size_card_left");

        room.handleSelectUIMode(room.current_selected_document.id);
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