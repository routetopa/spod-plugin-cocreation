$(document).ready(function(){
    $('#comments_content').perfectScrollbar();
    $('#metadatas').perfectScrollbar();

    window.addEventListener('message', function(e){
        $.post(ODE.ajax_coocreation_room_get_sheetdata,
            {
                sheetName: COCREATION.sheetName
            },
            function (data, status) {
                $("#datalet")[0].behavior.data = JSON.parse(data);
                data_room.refreshDatalet();
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
var data_room = document.querySelector('template[is="dom-bind"]');

data_room.cc_mode          = "";
data_room.cc_selected_mode = "";

data_room._handleCcModeClick = function(e){
    data_room.cc_mode = e.currentTarget.id;
    switch(e.currentTarget.id) {
        case "cc_mode_0":
            if(data_room.cc_selected_mode == "cc_mode_0") break;
            $("#datalets_slider_container").toggle('blind',
                { direction: 'top'},
                function(){
                    $("#datalets_slider_container").css('display', 'none');
                    $("#shared_spreadsheet").css('width', '100%');
                },
                500);
            $("#cc_mode_1").css('background-color', '#B6B6B6');
            $("#cc_mode_2").css('background-color', '#B6B6B6');
            $(e.currentTarget).css('background-color', '#00BCD4');
            data_room.cc_selected_mode = "cc_mode_0";
            break;
        case "cc_mode_1":
            if(data_room.cc_selected_mode == "cc_mode_1") break;
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
            data_room.cc_selected_mode = "cc_mode_1";
            data_room.refreshDatalet();
            break;
        case "cc_mode_2":
            if(data_room.cc_selected_mode == "cc_mode_2") break;
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
            data_room.cc_selected_mode = "cc_mode_2";
            data_room.refreshDatalet();
            break;
    }
}

data_room.refreshDatalet = function(){
    setTimeout(function () {
        var datalet = $('#datalet')[0];

        if (datalet != undefined && datalet.behavior != undefined && datalet.nodeName != "DATATABLE-DATALET") {
            if (datalet.refresh != undefined)
                datalet.refresh();
            else {
                datalet.behavior.transformData();
                datalet.behavior.presentData();
            }
        }
    }, 1500);
}

data_room._openInfo = function(){
    data_room.$.dialog_info.open();
};

data_room.init = function(){
    //catch ethersheet messages
    /*var socket = io("http://" + window.location.hostname +":8001");
    socket.on('*', function(rawData) {
        console.log("ilc");
    });*/
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
    var core_common_required_metadatas      = $("#core_common_required_metadatas").children();
    var common_core_if_applicable_metadatas = $("#common_core_if_applicable_metadatas").children();
    var expanded_metadatas                  = $("#expanded_metadatas").children();

    var ccr  = {}
    var ccia = {}
    var e    = {}

    for(var i = 0; i < core_common_required_metadatas.length; i++)
       ccr[$(core_common_required_metadatas[i]).attr('metadata')] = core_common_required_metadatas[i].getValue();

    for(i = 0; i < common_core_if_applicable_metadatas.length; i++)
        ccia[$(common_core_if_applicable_metadatas[i]).attr('metadata')] = common_core_if_applicable_metadatas[i].getValue();

    for(i = 0; i < expanded_metadatas.length; i++)
        e[$(expanded_metadatas[i]).attr('metadata')] = expanded_metadatas[i].getValue();

    $.post(ODE.ajax_coocreation_room_update_metadatas,
        {
            core_common_required_metadatas      : JSON.stringify(ccr),
            common_core_if_applicable_metadatas : JSON.stringify(ccia),
            expanded_metadatas                  : JSON.stringify(e)
        },
        function (data, status) {

            var status = JSON.parse(data);

        }
    );
}