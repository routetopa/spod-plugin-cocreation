$( document).ready(function(){
});

window.addEventListener('page-slider-controllet_selected', function (e) {

    if(e.srcElement.id == "slider_datalets") {

        room.$.slider_datalets = e.srcElement;

        try {
            room.$.slider_datalets.chevronLeft(true);
            room.$.slider_datalets.chevronRight(true);

            if (e.detail.selected == 0) {
                room.$.slider_datalets.chevronLeft(false);
                room.$.slider_datalets.chevronRight(true);
            } else if (e.detail.selected == ODE.numDataletsInCocreationRooom - 1) {
                room.$.slider_datalets.chevronLeft(true);
                room.$.slider_datalets.chevronRight(false);
            }
            room.$.slider_datalets.setTitle("Datalet " + (e.detail.selected + 1), "");
        }catch(e){console.log(e)}

        room.sliderRefreshCurrentDatalet();
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
                OW.info(OW.getLanguageText('cocreationep', 'postit_add_fail'));
            }
        }
    );
});

room._addDatalet = function(op){
    switch(op)
    {
        case "new":
            room.refreshDatasets();
            ODE.pluginPreview = "cocreation";
            previewFloatBox = OW.ajaxFloatBox('ODE_CMP_Preview', {text:'testo'} , {width:'90%', height:'90vh', iconClass:'ow_ic_lens', title:''});
            break;
        case "myspace":
            break;
    }
}

//trick8
room.sliderRefreshCurrentDatalet = function() {

    setTimeout(function () {
        var datalet = $('div[id^="datalet_placeholder_'+ room.$.slider_datalets.selected + '"]').children()[1];

        if (datalet != undefined && datalet.behavior != undefined && datalet.nodeName != "DATATABLE-DATALET") {
            if (datalet.refresh != undefined)
                datalet.refresh();
            else
                datalet.behavior.presentData();
        }
    }, 1500);
}

room.initSlider = function(){
    var socket = io("http://" + window.location.hostname +":3000");

    socket.on('realtime_message_' + COCREATION.entity_type + "_" + COCREATION.roomId, function(rawData) {
        switch(rawData.operation){
            case "addPostitToDatalet":
                $('#postit_container_' + rawData.dataletId ).html('<postit-container-controllet' +
                    ' id="postit_' + rawData.dataletId + '"' +
                    ' class="postit"' +
                    ' open=true' +
                    ' data=\'' + rawData.postits + '\'>' +
                    '</postit-container-controllet>');
                break;
        }
    });
}