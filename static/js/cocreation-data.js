$(document).ready(function(){
    $('#comments_content').perfectScrollbar();
    $('#metadatas').perfectScrollbar();

    window.addEventListener('message', function(e){
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
                var metadatas = room.getMetadatas();
                $.post(ODE.ajax_coocreation_room_publish_dataset,
                    {
                        roomId                              : COCREATION.roomId,
                        datasetId                           : COCREATION.sheetName,
                        owners                              : COCREATION.room_members,
                        data                                : room.current_dataset,
                        notes                               : data,
                        common_core_required_metadatas      : metadatas.core_common_required_metadatas,
                        common_core_if_applicable_metadatas : metadatas.core_common_if_applicable_metadatas,
                        expanded_metadatas                  : metadatas.expanded_metadatas
                    },
                    function (data, status) {

                    }
                );
            }
        }
    );
}

room.getMetadatas = function()
{
    var core_common_required_metadatas      = $("#core_common_required_metadatas").children();
    var common_core_if_applicable_metadatas = $("#common_core_if_applicable_metadatas").children();
    var expanded_metadatas                  = $("#expanded_metadatas").children();

    var ccr  = {};
    var ccia = {};
    var e    = {};

    for(var i = 0; i < core_common_required_metadatas.length; i++)
        ccr[$(core_common_required_metadatas[i]).attr('metadata')] = core_common_required_metadatas[i].getValue();

    for(i = 0; i < common_core_if_applicable_metadatas.length; i++)
        ccia[$(common_core_if_applicable_metadatas[i]).attr('metadata')] = common_core_if_applicable_metadatas[i].getValue();

    for(i = 0; i < expanded_metadatas.length; i++)
        e[$(expanded_metadatas[i]).attr('metadata')] = expanded_metadatas[i].getValue();

    return {core_common_required_metadatas : ccr, core_common_if_applicable_metadatas : ccia, expanded_metadatas : e };
}

var left_data_room = document.querySelector('#left_data_room');
left_data_room.selectedTab           = 0;
left_data_room._tabClicked = function(e){
    left_data_room.selectedTab = e.currentTarget.id;
}

left_data_room.addMetadata = function(){
   $("#metadatas").append('<metadata-element-controllet ' +
                                'number="x" ' +
                                'description="The name for the current dataset" ' +
                                'heading="Dataset name" '+
                          '></metadata-element-controllet>');
}

left_data_room.saveMetadatas = function(){

    var metadatas = room.getMetadatas();

    $.post(ODE.ajax_coocreation_room_update_metadatas,
        {
            roomId                              : COCREATION.roomId,
            core_common_required_metadatas      : JSON.stringify(metadatas.core_common_required_metadatas),
            common_core_if_applicable_metadatas : JSON.stringify(metadatas.core_common_if_applicable_metadatas),
            expanded_metadatas                  : JSON.stringify(metadatas.expanded_metadatas)
        },
        function (data, status) {

            var response = JSON.parse(data);
            if(response.status == "ok"){
                left_data_room.$.syncMessage.innerHTML = "Metadatas successfully saved";
                left_data_room.$.syncToast.show();
            }else{
                left_data_room.$.syncMessage.innerHTML = "Error saving metadatas. Please check the values.";
                left_data_room.$.syncToast.show();
            }
        }
    );
}