/*$(window).load(function () {
    $('#spreadsheet').append('<iframe id="spreadsheet_container" src="' + (location.protocol + "//" + location.host + ":" + COCREATION.spreadsheet_server_port + "/s/" + COCREATION.sheetName) + '" style="height: 100%; width: 100%;"></iframe>');
});*/

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
                $.post(ODE.ajax_coocreation_room_get_datalets,
                    {
                        roomId: COCREATION.roomId
                    },
                    function (data, status) {
                        data = JSON.parse(data);
                        COCREATION.datalets = data.datalets;
                        room.$.datalets_slider.setDatalets([]);
                        setTimeout(function(){room.$.datalets_slider.setDatalets(COCREATION.datalets);},100);
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

    window.addEventListener('datalet-slider-controllet_attached', function(e){
        room.$.datalets_slider.setDatalets(COCREATION.datalets);
    });

    window.addEventListener('info-list-controllet_attached', function(e){
        room.$.info_list_controllet.setInfo(COCREATION.info);
    });

    window.addEventListener('metadata-list-controllet_attached', function(e){
        room.$.metadata_component.setMetadata(COCREATION.metadata);
    });

    window.addEventListener('image-slider-datalet_attached', function(e){
        $.get(COCREATION.sheet_images_url,
            function (data, status) {
                if(data.status)
                {
                    room.$.image_slider.setImages(data.images);
                }
            }
        );
    });
});

room.splitScreenActive          = false;
room.current_selected_container = null;

room.handleSelectUIMode = function(mode){
    //Standard init
    room.$.spreadsheet.style.visibility = (!room.splitScreenActive) ?  "hidden" : "visible";
    room.$.metadata.style.visibility    = 'hidden';
    room.$.notes.style.visibility       = 'hidden';
    room.$.images.style.visibility      = 'hidden';
    room.$.discussion.style.visibility  = 'hidden';
    room.$.datalets.style.display       = 'none';
    room.$.info.style.visibility        = 'hidden';

    switch(mode){
        case 'dataset':
            room.$.spreadsheet.style.visibility = "visible";
            break;
        case 'metadata':
            room.current_selected_container = room.$.metadata;
            room.$.metadata.style.visibility    = 'visible';
            break;
        case 'notes':
            room.current_selected_container = room.$.notes;
            room.$.notes.style.visibility       = 'visible';
            break;
        case 'images':
            room.current_selected_container = room.$.notes;
            room.$.images.style.visibility      = 'visible';
            break;
        case 'discussion':
            room.current_selected_container = room.$.discussion;
            room.$.discussion.style.visibility  = 'visible';
            SPODDISCUSSION.init();
            break;
        case 'datalets':
            room.current_selected_container = room.$.datalets;
            room.$.datalets.style.display       = 'block';
            room.$.datalets_slider._refresh();
            break;
        case 'info':
            room.current_selected_container  = room.$.info;
            room.$.info.style.visibility        = 'visible';
            break;
        case 'split':
            room.$.split_checkbox.checked = !room.$.split_checkbox.checked;
            room.handleSplitScreen(room.$.split_checkbox);
            break;
    }

};

room.handleSplitScreen = function(e){
    room.splitScreenActive  = e.checked;

    room.$.spreadsheet.style.visibility = "visible";
    room.$.metadata.style.visibility    = 'hidden';
    room.$.notes.style.visibility       = 'hidden';
    room.$.images.style.visibility      = 'hidden';
    room.$.discussion.style.visibility  = 'hidden';
    room.$.datalets.style.display       = 'none';
    room.$.info.style.visibility        = 'hidden';

   if(room.splitScreenActive){//active split screen
       room.$.dataset_menu_item.disabled = true;

       room.$.datalets_slider._refresh();

       if(room.current_selected_container == null){
           room.current_selected_container  = room.$.metadata;
           room.$.section_menu.selected     = 1;
       }

       if(room.current_selected_container == room.$.datalets)
          room.current_selected_container.style.display = "block";
       else
          room.current_selected_container.style.visibility = "visible";

       $(room.$.spreadsheet).addClass("split_size_card_left");
       $(room.$.metadata).addClass("split_size_card_right");
       $(room.$.notes).addClass("split_size_card_right");
       $(room.$.images).addClass("split_size_card_right");
       $(room.$.discussion).addClass("split_size_card_right");
       $(room.$.datalets).addClass("split_size_card_right");
       $(room.$.info).addClass("split_size_card_right");
   }else{
       room.$.dataset_menu_item.disabled = false;
       room.$.section_menu.selected      = 0;
       room.current_selected_container   = null;

       $(room.$.spreadsheet).removeClass("split_size_card_left");
       $(room.$.metadata).removeClass("split_size_card_right");
       $(room.$.notes).removeClass("split_size_card_right");
       $(room.$.images).removeClass("split_size_card_right");
       $(room.$.discussion).removeClass("split_size_card_right");
       $(room.$.datalets).removeClass("split_size_card_right");
       $(room.$.info).removeClass("split_size_card_right");
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
    if(confirm(OW.getLanguageText('cocreation', 'privacy_message_datalet_published')))
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
                            common_core_required_metadata       : metadata.CC_RF,
                            common_core_if_applicable_metadat   : metadata.CC_RAF,
                            expanded_metadata                   : metadata.EF
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

////////////////////////////////////////////////
/// FUNCTION TO IMPORT DATASET FROM CKAN/SPOD.
///

room._importDatasetFromSPOD = function () {
    this.previewFloatBoxImportFromSPOD = OW.ajaxFloatBox('COCREATION_CMP_ImportDatasetFromSpod', { message: 'loading ...' }, {width:'90%', height:'80vh', iconClass:'ow_ic_lens', title:'MyTitle'} );
};//EndFunction.

room._uploadDatasetOnEthersheet = function (event, cb) {
    //Prepare CSV file.
    const _jsonDataset = event.detail.dataset.data;
    const _csvDataset = room._convertDatasetToCSV(_jsonDataset);
    const fileCSVDataset = new File([_csvDataset], "dummy.csv", { type: 'application/vnd.ms-excel' });

    var formData = new FormData();
    formData.append("csv_file", fileCSVDataset);
    formData.append("sheet_name", COCREATION.sheetName);
    //formData.append("sheet_id", COCREATION.sheetName);
    //formData.append("sheet_id", "55074c27-52d6-4208-b30e-c917b4c1702f");

    //Create the target url.
    var href = window.location.href;
    var domain = href.substring(0, href.indexOf("/cocreation"));
    var targetUrl = domain + "/ethersheet/import/csv" + "?sheetName=" + COCREATION.sheetName;

    //Perform HTTP POST REQUEST.
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function (event) {
        document.querySelector('#spreadsheet_container').contentWindow.location.reload(true);
        if(typeof room.previewFloatBoxImportFromSPOD != 'undefined')
            room.previewFloatBoxImportFromSPOD.close();
        cb({ success: true });
    };
    xhttp.onerror = function (event) {
        document.querySelector('#spreadsheet_container').contentWindow.location.reload(true);
        cb({ success: false, error: xhttp.statusText });
    };
    xhttp.open("POST", targetUrl, true);
    xhttp.send(formData);
};//EndFunction.

room._convertDatasetToCSV = function (_jsonData) {
    var _csvData = "";

    //Header.
    var keys = Object.keys(_jsonData[0]);
    var _csvHeader = "";
    for (var j=0, _key; j<keys.length && (_key=keys[j]); j++) { //Loop on keys.
        _csvHeader += _key + (j<keys.length-1 ? ';' : "\r\n" );
    }//EndFor.
    _csvData += _csvHeader;

    //Rows.
    for (var i=0,_row; i<_jsonData.length && (_row=_jsonData[i]); i++) {//Loop on rows.
        var _csvRow = "";
        for (var j=0, _key; j<keys.length && (_key=keys[j]); j++) { //Loop on column.
            var value = _row[_key];
            _csvRow += value + (j<keys.length-1 ? ';' : "\r\n" );
        }//EndForCols.
        _csvData += _csvRow;
    }//EndForRows.

    return _csvData;
};//EndFunction.