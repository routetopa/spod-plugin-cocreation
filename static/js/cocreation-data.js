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
                        room.loadDataletsSlider();
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

    $(".sentiment-button").live("click", function()
    {
        var id = $(this).attr('id');
        switch($(this).attr('icon')){
            case "face":
                $(this).attr('icon', 'social:mood');
                $(this).attr('sentiment', '2');
                break;
            case "social:mood":
                $(this).attr('icon', 'social:mood-bad');
                $(this).attr('sentiment', '3');
                break;
            case "social:mood-bad":
                $(this).attr('icon', 'face');
                $(this).attr('sentiment', '1');
                break;
        }
    });

/*
    $('#discussion').perfectScrollbar();
*/

    setTimeout(function(){
        room.$.datalets_slider.setDatalets(COCREATION.datalets);
        room.$.metadata_component.setMetadata(COCREATION.metadata);
        /*room.loadDiscussion();*/
    },1000);
});

room.splitScreenActive = false;

room.handleSelectUIMode = function(mode){
    switch(mode){
        case 'dataset':
            room.$.spreadsheet.style.display = "block";
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'none';
            break;
        case 'metadata':
            if(!room.splitScreenActive) room.$.spreadsheet.style.display = "none";
            room.$.metadata.style.display    = 'block';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'none';
            break;
        case 'notes':
            if(!room.splitScreenActive) room.$.spreadsheet.style.display = "none";
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'block';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'none';
            break;
        case 'discussion':
            if(!room.splitScreenActive) room.$.spreadsheet.style.display = "none";
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'block';
            room.$.datalets.style.display    = 'none';
            break;
        case 'datalets':
            if(!room.splitScreenActive) room.$.spreadsheet.style.display = "none";
            room.$.metadata.style.display    = 'none';
            room.$.notes.style.display       = 'none';
            room.$.discussion.style.display  = 'none';
            room.$.datalets.style.display    = 'block';
            room.$.datalets_slider._refresh();
            break;
    }

};

room.handleSplitScreen = function(e){
    room.splitScreenActive  = !e.checked;
   if(room.splitScreenActive){//active split screen

       room.$.dataset_menu_item.disabled = true;

       room.$.spreadsheet.style.display = "block";
       room.$.metadata.style.display    = 'block';
       room.$.notes.style.display       = 'none';
       room.$.discussion.style.display  = 'none';
       room.$.datalets.style.display    = 'none';

       $(room.$.spreadsheet).addClass("split_size_card_left");
       $(room.$.metadata).addClass("split_size_card_right");
       $(room.$.notes).addClass("split_size_card_right");
       $(room.$.discussion).addClass("split_size_card_right");
       $(room.$.datalets).addClass("split_size_card_right");
   }else{
       room.$.dataset_menu_item.disabled = false;

       room.$.spreadsheet.style.display = "block";
       room.$.metadata.style.display    = 'none';
       room.$.notes.style.display       = 'none';
       room.$.discussion.style.display  = 'none';
       room.$.datalets.style.display    = 'none';

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
            previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_PublishDataset', {data: data} , {width:'90%', height:'90vh', iconClass:'ow_ic_lens', title:''});
        }
    );
};

room.confirmDatasetPublication = function(){
    $.get(ODE.ajax_coocreation_room_get_html_note,
        function (data, status) {
            if(JSON.parse(data).status == "ok")
            {
                var metadata = room.getMetadata();
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

/*to delete*/


/*room.cc_mode          = "";
room.cc_selected_mode = "";

room._handleCcModeClick = function(e){

    if(e.currentTarget.id == room.cc_mode) return;
    room.cc_mode = e.currentTarget.id;

    var datalets_slider_container     = $("#datalets_slider_container");
    var cc_mode_0_button              = $("#cc_mode_0");
    var cc_mode_1_button              = $("#cc_mode_1");
    var cc_mode_2_button              = $("#cc_mode_2");
    var shared_spreadsheet_container  = $("#shared_spreadsheet");

    datalets_slider_container.toggle('blind',
        { direction: 'top'},
        function(){
            switch(room.cc_mode) {
                case "cc_mode_0":
                    datalets_slider_container.css('display', 'none');
                    shared_spreadsheet_container.css('display', 'block');
                    shared_spreadsheet_container.css('width', '100%');

                    cc_mode_1_button.css('background-color', '#B6B6B6');
                    cc_mode_2_button.css('background-color', '#B6B6B6');
                    cc_mode_0_button.css('background-color', '#00BCD4');
                    break;
                case "cc_mode_1":
                    shared_spreadsheet_container.css('display', 'block');
                    datalets_slider_container.css('display', 'block');
                    datalets_slider_container.css('width', '50%');
                    shared_spreadsheet_container.css('width', '50%');

                    cc_mode_0_button.css('background-color', '#B6B6B6');
                    cc_mode_2_button.css('background-color', '#B6B6B6');
                    cc_mode_1_button.css('background-color', '#00BCD4');
                    break;
                case 'cc_mode_2':
                    datalets_slider_container.css('width', '100%');
                    datalets_slider_container.css('display', 'block');
                    shared_spreadsheet_container.css('display', 'none');

                    cc_mode_0_button.css('background-color', '#B6B6B6');
                    cc_mode_1_button.css('background-color', '#B6B6B6');
                    cc_mode_2_button.css('background-color', '#00BCD4');
                    break;
            }
        },
        500);
};

$("#fullscreen-comment-close-button").click(function(){
    $( "#comments_content" ).slideUp( "fast", function() {
        $('#comments_content').css('display','none');
        $('#fullscreen-comment-close-button').css('display', 'none');
        $('#fullscreen-comment-open-button').css('display', 'block');
    });
});

$("#fullscreen-comment-open-button").click(function(){
    $( "#comments_content" ).show( "fast", function() {
        $('#comments_content').css('display','block');
        $('#fullscreen-comment-close-button').css('display', 'block');
        $('#fullscreen-comment-open-button').css('display', 'none');
    });
});

var left_data_room = document.querySelector('#left_data_room');
left_data_room.selectedTab           = 0;
left_data_room._tabClicked = function(e){

    var last_selected_doc = $("#doc" + left_data_room.selectedTab);
    var new_selected_doc  = $("#doc" + e.currentTarget.id.split("_")[1]);
    var all_docs          = $("paper-material[id^='doc']");
    //update selection
    left_data_room.selectedTab = e.currentTarget.id.split("_")[1];
    //do document switching logic
    last_selected_doc.removeClass("visible_doc");
    all_docs.addClass("hidden_doc");
    new_selected_doc.removeClass("hidden_doc");
    new_selected_doc.addClass("visible_doc");
}

left_data_room.addMetadata = function(){
   $("#metadata").append('<metadata-element-controllet ' +
                                'number="x" ' +
                                'description="The name for the current dataset" ' +
                                'heading="Dataset name" '+
                          '></metadata-element-controllet>');

 room.saveMetadata = function(){

 var metadata = room.getMetadata();

 $.post(ODE.ajax_coocreation_room_update_metadata,
 {
 roomId                             : COCREATION.roomId,
 core_common_required_metadata      : JSON.stringify(metadata.core_common_required_metadata),
 common_core_if_applicable_metadata : JSON.stringify(metadata.core_common_if_applicable_metadata),
 expanded_metadata                  : JSON.stringify(metadata.expanded_metadata)
 },
 function (data, status) {

 var response = JSON.parse(data);
 if(response.status == "ok"){
 room.$.syncMessage.innerHTML = OW.getLanguageText('cocreation', 'metadata_successfully_saved');
 room.$.syncToast.show();
 }else{
 room.$.syncMessage.innerHTML = OW.getLanguageText('cocreation', 'error_metadata_updates');
 room.$.syncToast.show();
 }
 }
 );
 };

 room.loadMetadata = function(core_common_required_metadata, common_core_if_applicable_metadata, expanded_metadata){

 for(var meta in core_common_required_metadata){

 $("[metadata='"+ meta + "']")[0].value = core_common_required_metadata[meta];
 }

 for(meta in common_core_if_applicable_metadata){
 $("[metadata='"+ meta + "']")[0].value = common_core_if_applicable_metadata[meta];
 }

 for(meta in expanded_metadata){
 $("[metadata='"+ meta + "']")[0].value = expanded_metadata[meta];
 }

 };

 room.getMetadata = function(){
 var core_common_required_metadata      = $("#core_common_required_metadata").children();
 var common_core_if_applicable_metadata = $("#common_core_if_applicable_metadata").children();
 var expanded_metadata                  = $("#expanded_metadata").children();

 var ccr  = {};
 var ccia = {};
 var e    = {};

 for(var i = 0; i < core_common_required_metadata.length; i++)
 ccr[$(core_common_required_metadata[i]).attr('metadata')] = core_common_required_metadata[i].getValue();

 for(i = 0; i < common_core_if_applicable_metadata.length; i++)
 ccia[$(common_core_if_applicable_metadata[i]).attr('metadata')] = common_core_if_applicable_metadata[i].getValue();

 for(i = 0; i < expanded_metadata.length; i++)
 e[$(expanded_metadata[i]).attr('metadata')] = expanded_metadata[i].getValue();

 return {core_common_required_metadata : ccr, core_common_if_applicable_metadata : ccia, expanded_metadata : e };
 };

}*/