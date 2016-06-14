var room = document.querySelector('template[is="dom-bind"]');

room._openInfo = function(){
    room.$.dialog_info.open();
};

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
                room.$.syncMessage.innerHTML = "New dataset has been added";
                room.$.syncToast.show();
                break;
            case "addDataletToRoom":
                var scope = room;
                if(COCREATION.room_type == "data") scope = left_data_room;
                room.loadDataletsSlider();
                scope.$.syncMessage.innerHTML = "New datalet has been added";
                scope.$.syncToast.show();
                break;
            case "addPostitToDatalet":
                room._handleCcModeClick({currentTarget : {id : room.cc_mode}});
                room.$.syncMessage.innerHTML = "New postit has been added";
                room.$.syncToast.show();
                break;
            case "updateMetadatas":
                room.loadMetadatas(JSON.parse(rawData.core_common_required_metadatas),
                                   JSON.parse(rawData.common_core_if_applicable_metadatas),
                                   JSON.parse(rawData.expanded_metadatas ));
                left_data_room.$.syncMessage.innerHTML = "Metadatas updates";
                left_data_room.$.syncToast.show();
                break;
        }
    });
}

room.loadDataletsSlider = function(){
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
