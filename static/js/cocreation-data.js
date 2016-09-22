$(document).ready(function(){
    $('#comments_content').perfectScrollbar();
    $('#metadata').perfectScrollbar();

    window.addEventListener('open-select-merker-map_event', function(e){
        alert("open map");
    });

    window.addEventListener('cocreation-paper-card-controllet_delete', function(e){
        var c = confirm(OW.getLanguageText('cocreationep', 'confirm_delete_datalet'));
        if(c == true) {
            $.post(ODE.ajax_coocreation_room_delete_datalet,
                {
                    roomId: e.detail.roomId
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
    });

    window.addEventListener('message', function(e){
        switch(e.data){
            case 'ethersheet_sheet_updated':
                $.post(ODE.ajax_coocreation_room_get_sheetdata,
                    {
                        sheetName: COCREATION.sheetName
                    },
                    function (data, status) {
                        var datalet = $('div[id^="datalet_placeholder_"]').children();
                        for(var i=1; i < datalet.length; i+=2){
                            datalet[i].behavior.data = JSON.parse(data);
                        }
                        room.loadDataletsSlider();
                    }
                );
                break;
            case 'open-select-merker-map_event':
                //if(previewFloatBox != 'undefined') previewFloatBox.close();
                ODE.pluginPreview = "cocreation";
                previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_AddMarker', {} , {width:'90%', height:'90vh', iconClass:'ow_ic_lens', title:''});
                break;
        }
    });

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
});

room.cc_mode          = "";
room.cc_selected_mode = "";

room._handleCcModeClick = function(e){
    room.cc_mode = e.currentTarget.id;
    switch(e.currentTarget.id) {
        case "cc_mode_0":
            if(room.cc_selected_mode == "cc_mode_0") break;
            $("#datalets_slider_container").toggle('blind',
                { direction: 'top' },
                function(){
                    $("#datalets_slider_container").css('display', 'none');
                    $("#shared_spreadsheet").css('width', '100%');
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
                    $("#shared_spreadsheet").css('width', '50%');
                },
                500);
            $("#cc_mode_0").css('background-color', '#B6B6B6');
            $("#cc_mode_2").css('background-color', '#B6B6B6');
            $(e.currentTarget).css('background-color', '#00BCD4');
            room.cc_selected_mode = "cc_mode_1";
            room.refreshDatalet();
            break;
        case "cc_mode_2":
            if(room.cc_selected_mode == "cc_mode_2") break;
            $("#datalets_slider_container").toggle('blind',
                { direction: 'top'},
                function(){
                    $("#datalets_slider_container").css('width', '100%');
                    $("#datalets_slider_container").css('display', 'block');
                    $("#shared_spreadsheet").css('width', '0px');
                },
                500);
            $("#cc_mode_0").css('background-color', '#B6B6B6');
            $("#cc_mode_1").css('background-color', '#B6B6B6');
            $(e.currentTarget).css('background-color', '#00BCD4');
            room.cc_selected_mode = "cc_mode_2";
            room.refreshDatalet();
            break;
    }
}

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
}

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
}

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
}

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

}

var left_data_room = document.querySelector('#left_data_room');
left_data_room.selectedTab           = 0;
left_data_room._tabClicked = function(e){
    left_data_room.selectedTab = e.currentTarget.id.split("_")[1];
}

left_data_room.addMetadata = function(){
   $("#metadata").append('<metadata-element-controllet ' +
                                'number="x" ' +
                                'description="The name for the current dataset" ' +
                                'heading="Dataset name" '+
                          '></metadata-element-controllet>');
}

left_data_room.saveMetadata = function(){

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
                left_data_room.$.syncMessage.innerHTML = OW.getLanguageText('cocreation', 'metadata_successfully_saved');
                left_data_room.$.syncToast.show();
            }else{
                left_data_room.$.syncMessage.innerHTML = OW.getLanguageText('cocreation', 'error_metadata_updates');
                left_data_room.$.syncToast.show();
            }
        }
    );
}