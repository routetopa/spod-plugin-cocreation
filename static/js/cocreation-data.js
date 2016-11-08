$(document).ready(function() {

   /* window.addEventListener('cocreation-paper-card-controllet_delete', function (e) {
        var c = confirm(OW.getLanguageText('cocreation', 'confirm_delete_datalet'));
        if (c == true) {
            $.post(ODE.ajax_coocreation_room_delete_datalet,
                {
                    roomId          : e.detail.roomId
                },
                function (data, status) {
                    data = JSON.parse(data);
                    if (data.status == "ok") {
                    } else {
                        OW.info(OW.getLanguageText('cocreation', 'room_delete_fail'));
                    }
                }
            );
        }
    });*/

    window.addEventListener('metadata-list-controllet_update-metadata', function(e){
        var metadata = JSON.parse(e.detail.metadata);
        $.post(ODE.ajax_coocreation_room_update_metadata,
            {
                roomId                             : COCREATION.roomId,
                core_common_required_metadata      : JSON.stringify(metadata.CC_RF),
                common_core_if_applicable_metadata : JSON.stringify(metadata.CC_RAF),
                expanded_metadata                  : JSON.stringify(metadata.EF)
            },
            function (data, status) {
                COCREATION.metadata = metadata;
                /*var response = JSON.parse(data);
                if(response.status == "ok"){
                    room.$.syncMessage.innerHTML = OW.getLanguageText('cocreation', 'metadata_successfully_saved');
                    room.$.syncToast.show();
                }else{
                    room.$.syncMessage.innerHTML = OW.getLanguageText('cocreation', 'error_metadata_updates');
                    room.$.syncToast.show();
                }*/
            }
        );
    });

    window.addEventListener('message', function (e) {
        switch (e.data) {
            case 'ethersheet_sheet_updated':
                $.post(ODE.ajax_coocreation_room_get_sheetdata,
                    {
                        sheetName: COCREATION.sheetName
                    },
                    function (data, status) {
                        var datalet = $('div[id^="datalet_placeholder_"]').children();
                        for (var i = 1; i < datalet.length; i += 2) {
                            datalet[i].behavior.data = JSON.parse(data);
                        }
                        //room.loadDataletsSlider();
                    }
                );
                break;
            case 'open-select-merker-map_event':
                //if(previewFloatBox != 'undefined') previewFloatBox.close();
                ODE.pluginPreview = "cocreation";
                previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_AddMarker', {}, {
                    width: '90%',
                    height: '90vh',
                    iconClass: 'ow_ic_lens',
                    title: ''
                });
                break;
        }
    });

    setTimeout(function(){
        room.$.datalets_slider.setDatalets(COCREATION.datalets);
        room.$.metadata_component.setMetadata(COCREATION.metadata);
        room.$.info_list_controllet.setInfo(COCREATION.info);
    },1000);
});

room.splitScreenActive          = false;
room.current_selected_container = null;

room.handleSelectUIMode = function(mode){
    if(!room.splitScreenActive) room.$.spreadsheet.style.display = "none";
    switch(mode){
        case 'dataset':
            room.$.spreadsheet.style.display = "block";
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'none';
            room.$.info.style.display        = 'none';
            break;
        case 'metadata':
            room.current_selected_container = room.$.metadata;
            room.$.metadata.style.display    = 'block';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'none';
            room.$.info.style.display        = 'none';
            break;
        case 'notes':
            room.current_selected_container = room.$.notes;
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'block';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'none';
            room.$.info.style.display        = 'none';
            break;
        case 'discussion':
            room.current_selected_container = room.$.discussion;
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'block';
            room.$.datalets.style.display    = 'none';
            room.$.info.style.display        = 'none';
            break;
        case 'datalets':
            room.current_selected_container = room.$.datalets;
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'block';
            room.$.info.style.display        = 'none';
            room.$.datalets_slider._refresh();
            break;
        case 'info':
            room.current_selected_container  = room.$.info;
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'none';
            room.$.info.style.display        = 'block';
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
       room.$.dataset_menu_item.disabled = true;

       room.$.spreadsheet.style.display = "block";
       room.$.metadata.style.display    = 'none';
       room.$.notes.style.display       = 'none';
       room.$.discussion.style.display  = 'none';
       room.$.datalets.style.display    = 'none';
       room.$.info.style.display        = 'none';

       if(room.current_selected_container == null){
           room.current_selected_container  = room.$.metadata;
           room.$.section_menu.selected     = 1;
       }
       room.current_selected_container.style.display = "block";

       $(room.$.spreadsheet).addClass("split_size_card_left");
       $(room.$.metadata).addClass("split_size_card_right");
       $(room.$.notes).addClass("split_size_card_right");
       $(room.$.discussion).addClass("split_size_card_right");
       $(room.$.datalets).addClass("split_size_card_right");
       $(room.$.info).addClass("split_size_card_right");
   }else{
       room.$.dataset_menu_item.disabled = false;
       room.$.section_menu.selected      = 0;
       room.current_selected_container   = null;

       room.$.spreadsheet.style.display = "block";
       room.$.metadata.style.display    = 'none';
       room.$.notes.style.display       = 'none';
       room.$.discussion.style.display  = 'none';
       room.$.datalets.style.display    = 'none';
       room.$.info.display              = 'none';

       $(room.$.spreadsheet).removeClass("split_size_card_left");
       $(room.$.metadata).removeClass("split_size_card_right");
       $(room.$.notes).removeClass("split_size_card_right");
       $(room.$.discussion).removeClass("split_size_card_right");
       $(room.$.datalets).removeClass("split_size_card_right");
   }
};

room.current_dataset = "";

room._publishDataset = function(){
    $.post(ODE.ajax_coocreation_room_get_array_sheetdata,
        {
            sheetName: COCREATION.sheetName
        },
        function (data, status) {
            room.current_dataset = data;
            ODE.pluginPreview = "cocreation";
            previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_PublishDataset', {data: data} , {width:'90%', height:'80vh', iconClass:'ow_ic_lens', title:''});
        }
    );
};

room.confirmDatasetPublication = function(){
    $.get(ODE.ajax_coocreation_room_get_html_note,
        function (data, status) {
            if(JSON.parse(data).status == "ok")
            {
                var metadata = room.$.metadata_component.metadata;
                $.post(ODE.ajax_coocreation_room_publish_dataset,
                    {
                        roomId                              : COCREATION.roomId,
                        datasetId                           : COCREATION.sheetName,
                        owners                              : COCREATION.room_members,
                        data                                : room.current_dataset,
                        notes                               : data,
                        common_core_required_metadata       : metadata.core_common_required_metadata,
                        common_core_if_applicable_metadat   : metadata.core_common_if_applicable_metadata,
                        expanded_metadata                   : metadata.expanded_metadata
                    },
                    function (data, status) {
                        previewFloatBox.close();
                        OW.info(OW.getLanguageText('cocreation', 'dataset_successfully_published'));
                    }
                );
            }
        }
    );
};

room.loadDiscussion = function(){
    $.post(OW.ajaxComponentLoaderRsp + "?cmpClass=COCREATION_CMP_DiscussionWrapper",
        {params: "[\"" + COCREATION.roomId + "\"]"},
        function (data, status) {
            data = JSON.parse(data);

            $('#discussion_container').html(data.content);
            //onloadScript
            var onload = document.createElement('script');
            onload.setAttribute("type","text/javascript");
            onload.innerHTML = data.onloadScript;
        });
};