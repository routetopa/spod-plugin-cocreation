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
       //I want receive only my events, discard the others.
       //NOTE: this is to have multiple the metadata-list-controllet in the page as in the
       //cace of co-creation.
       if (e.target.id != "metadata_component") return;

       var metadata = JSON.parse(e.detail.metadata);
       room.persistMetadata(metadata);
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
                        setTimeout(function()
                            {
                               room.$.datalets_slider.setDatalets(COCREATION.datalets);
                               room.refreshImageSlider();
                            },
                            100);
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
        room.refreshImageSlider();
    });

    window.addEventListener('image-slider-datalet_delete', function(e){

        let img_cmp = e.detail.image.split('/');
        let collection_id = img_cmp[img_cmp.length - 2];
        let image_name    = img_cmp[img_cmp.length - 1];

        $.post(COCREATION.sheet_remove_image_url,
            {
                collection_id : collection_id,
                image_name    : image_name
            }
        )
        .done(function (data) {
            if(data.status) {
               room.refreshImageSlider();
            }
        })
        .fail(function(err){
          console.log(err);
        });
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
            //previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_PublishDataset', {data: data} , {width:'90%', height:'80vh', iconClass:'ow_ic_lens', title:''});
            previewFloatBox = OW.ajaxFloatBox('COCREATION_CMP_PublishDataset', {data: data} , {top:'56px', width:'calc(100vw - 128px)', height:'calc(100vh - 184px)', iconClass:'ow_ic_lens', title:''});
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

room.refreshImageSlider = function()
{
    $.get(COCREATION.sheet_images_url,
        function (data, status) {
            if (data.status) {
                room.$.image_slider.setImages(data.images);
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
/// METADATA MANAGEMENT
///

/**
 * Sends metadata to server to save them.
 */
room.persistMetadata = function (metadata) {
    $.post(ODE.ajax_coocreation_room_update_metadata,
        {
            roomId                             : COCREATION.roomId,
            core_common_required_metadata      : JSON.stringify(metadata.CC_RF),
            common_core_if_applicable_metadata : JSON.stringify(metadata.CC_RAF),
            expanded_metadata                  : JSON.stringify(metadata.EF)
        },
        function (data, status) {
            COCREATION.metadata = metadata;
        }
    );
};

////////////////////////////////////////////////
/// FUNCTION TO IMPORT DATASET FROM CKAN/SPOD.
///

room._importDatasetFromSPOD = function () {
    this.previewFloatBoxImportFromSPOD = OW.ajaxFloatBox('COCREATION_CMP_ImportDatasetFromSpod', { message: 'loading ...' }, {top:'56px', width:'calc(100vw - 112px)', height:'calc(100vh - 112px)', title:'MyTitle'} );
};//EndFunction.

////////////////////////////////////////////////
/// FUNCTION UPLOAD DATASET ON ETHERSHEET.
///

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

////////////////////////////////////////////////
/// FUNCTIONS TO PUBLISH ON CKAN.
///

room._publishOnCkan = function () {
    this.dialogPublishOnCKAN = OW.ajaxFloatBox('COCREATION_CMP_PublishDatasetOnCkan', { message: 'loading ...' }, {top:'56px', width:'calc(100vw - 128px)', height:'calc(100vh - 128px)', iconClass:'ow_ic_lens', title:''} );
};//EndFunction.

room._closeDialogPublishOnCKAN = function () {
    if(typeof room.dialogPublishOnCKAN != 'undefined')
        room.dialogPublishOnCKAN.close();
};//EndFunction.

room.showPackage = function(package_id, cb) {
    const $platformUrl = COCREATION.ckan_platform_url_preference ; //"http://ckan.routetopa.eu";
    const $keyapi = COCREATION.ckan_api_key_preference;//"8febb463-f637-45b3-a6cb-d8957cdefbf3";
    var client = new CKANClient($platformUrl, $keyapi);
    client.showPackage(package_id, cb);
};//EndFunction.

room.getSheetCSV = function () {
    //Test get CSV.
    return new Promise( (res, rej) =>
    {
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function (response) {
            const _responseText = response.currentTarget.responseText;
            const _responseCode = response.currentTarget.status;
            console.log("CSV: " + _responseText);

            if (_responseCode / 100 == 2)
                res(_responseText);
            else
                rej(_responseText);
        };
        xhttp.onerror = function (errResponse) {
            rej(errResponse);
        };
        const _exportEndPoint = window.location.protocol + "//" + window.location.hostname + "/ethersheet/export_to_csv/" + COCREATION.sheetName;
        xhttp.open("GET", _exportEndPoint, true);
        xhttp.send();
    });
};//EndFunction.

room.getSheetCSVFileInstance = async function () {
    const BOM = '\ufeff'
    var fileCSVData = await room.getSheetCSV();

    if (fileCSVData.length > 0 && fileCSVData.charCodeAt(0) != 65279)
        fileCSVData = BOM + fileCSVData;

    const filename = room._generateRandomFileName();
    return room._convertStringToCSVFile(fileCSVData, filename);
};//EndFunction.

room.updateOnCkan = async function(package_id, _jsonDataset, _jsonCocreationMetadata, notes, cb) {

    var fileCSVData;

    try {
        fileCSVData = await room.getSheetCSVFileInstance();
    } catch (e) {
        cb({ success: false, errors: [ "Cannot download CSV file from Ethersheet. Ethersheet Internal Error." ] });
        return;
    }

    const $platformUrl = COCREATION.ckan_platform_url_preference ; //"http://ckan.routetopa.eu";
    const $keyapi = COCREATION.ckan_api_key_preference;//"8febb463-f637-45b3-a6cb-d8957cdefbf3";
    var client = new CKANClient($platformUrl, $keyapi);

    //Prepare metadata.
    var result = this.prepareMetadataForCKAN(_jsonCocreationMetadata);
    if (!result.success) {
        cb(result);
        return;
    }
    var packageDataUpdate = result.metadata;

    /*const $dataset_title = _jsonCocreationMetadata.CC_RF.title;
    const $dataset_description = _jsonCocreationMetadata.CC_RF.description;
    const $contact_name = _jsonCocreationMetadata.CC_RF.contact_name;
    const $contact_email = _jsonCocreationMetadata.CC_RF.contact_email;
    var packageDataUpdate = { title: $dataset_title, notes: $dataset_description, description: $dataset_description,
        author: $contact_name, author_email: $contact_email };*/

    client.updatePackage(package_id, packageDataUpdate, function(response, err) {
        if (response.success) {//Package updated.
            //Update the resource.
            const _resources = JSON.parse(response.responseText).result.resources;

            var _filtered = _resources.filter(function (value) { return (value.format === "CSV"); } );
            if (_filtered.length == 0) {
                cb( {success: false, errors: [ 'Cannot find the CSV resource to update. ' ] });
                return;
            }
            if (_filtered.length > 1) {
                cb( {success: false, errors: [ 'There is more than one CSV resource, cannot determine which one to update. ' ] });
                return;
            }

            const _csvResource = _filtered[0];
            var resource_metadata = {
                package_id: package_id,
                format: 'CSV',
                url: _csvResource.url,
                name: packageDataUpdate.title,
                description: packageDataUpdate.description
            };

            client.updateResource(_csvResource.id, fileCSVData, resource_metadata, function (response) {
                if (response.success == true) { //CSV RESOURCE UPDATED WITH SUCCESS.

                    //Notes update.
                    if (notes != null) {
                        var _filtered = _resources.filter(function (value) { return (value.format === "TXT"); } );
                        if (_filtered.length > 1) {
                            cb( {success: false, errors: [ 'There is more than one TXT resource, cannot determine which one to update with notes. ' ] });
                            return;
                        }

                        var fileNotes = new File([notes.content], notes.filename + "." + notes.format, { type: notes.content_type });

                        var notesMetadata = JSON.parse(JSON.stringify(resource_metadata)); //Clone metadata.
                        notesMetadata.name = notes.filename;
                        notesMetadata.format = notes.format;
                        notesMetadata.description = "Co-creation notes";

                        if (_filtered == 0) {//Create the resource with notes.
                            client.createResource(package_id, fileNotes, notesMetadata, function (response, err) {
                                var uploadedPackageId = JSON.parse(response).result.id;
                                if (err != null) {
                                    var _jsonError = JSON.parse(response);
                                    var _errors = _jsonError.error.name;
                                    cb({ success: false, errors: _errors, package: { id: uploadedPackageId } });
                                } else
                                    cb({ success: true, package_id: package_id });
                            });//EndCreateResource.
                        } else {//Update resource notes.
                            var _txtResource = _filtered[0];
                            client.updateResource(_txtResource.id, fileNotes, notesMetadata, cb);
                        }
                    }

                    cb({success: true});
                    return;
                }

                //Manage the error here.
                cb({success: false });
            });

            return;
        }

        //Manage here the error.
        var ckanResponse = JSON.parse(response.responseText);
        var _errors = room.processCkanErrorMessage(ckanResponse);

        if (typeof cb !== 'undefined')
            cb({ success: false, errors: [ _errors ] });
        return;
    });
};//EndFunction.

room._convertCSVToFile = function (_jsonData) {
    const _csvData = room._convertDatasetToCSV(_jsonData);
    const roomName = JSON.parse(COCREATION.info).name + "_" + Math.floor((Math.random()*1000) + 1);
    const fileCSVData = new File([_csvData], roomName + ".csv", { type: 'application/CSV' });
    return fileCSVData;
};//EndFunction.

room._convertStringToCSVFile = function (sdata, filename) {
    const fileCSVData = new File([sdata], filename + ".csv", { type: 'application/CSV' });
    return fileCSVData;
};//EndFunction.

room._generateRandomFileName = function() {
    const roomName = JSON.parse(COCREATION.info).name + "_" + Math.floor((Math.random()*1000) + 1);
    return roomName;
};//EndFunction.

room.prepareMetadataForCKAN = function(_jsonCocreationMetadata) {
    //Before to start the upload it checks the metadata.
    const $dataset_title = _jsonCocreationMetadata.CC_RF.title;
    const $dataset_description = _jsonCocreationMetadata.CC_RF.description;
    //const $dataset_author = _jsonCocreationMetadata.CC_RF.author;
    const $contact_name = _jsonCocreationMetadata.CC_RF.contact_name;
    const $contact_email = _jsonCocreationMetadata.CC_RF.contact_email;

    const $dataset_maintainer = _jsonCocreationMetadata.CC_RF.maintainer;
    const $dataset_maintainer_email = _jsonCocreationMetadata.CC_RF.maintainer_email;

    const $dataset_version = _jsonCocreationMetadata.CC_RF.version;
    const $dataset_license_id = _jsonCocreationMetadata.license_id;

    const $dataset_language_id = _jsonCocreationMetadata.language_id;
    const $dataset_origin = _jsonCocreationMetadata.EF.origin;

    const $dataset_key = COCREATION.sheetName;

    debugger;

    const _msgErrors = {
        title_message: 'The title is a required field in the metadata.',
        description_message: 'The description is a required field in the metadata.',
        author_message: 'The Contact Name is a required field in the metadata.',
        author_email_message: 'The Contact E-mail is a required field in the metadata.',
        maintainer_message: 'The Maintainer is a required field in the metadata.',
        maintainer_email_message: 'The Maintainer E-mail is a required field in the metadata.',
        language_message: 'The language is a required field in the metadata.',
        version_message: 'The version is a required field in the metadata.',
        url_message: 'The origin is a required field in the metadata.',
        license_id_message: 'The license is a required field in the metadata.'
    };

    /*if ($dataset_title.trim().length == 0) {
        callbackUpload({ success: false, errors: [  ]});
        return;
    }

    if ($dataset_description.trim().length == 0) {
        callbackUpload({ success: false, errors: [ 'The description is required field in the metadata. Check dataset metadata.' ]});
        return;
    }*/

    const $deforganisation = COCREATION.ckan_def_organisation_preference;

    if (typeof $deforganisation === 'undefined' || $deforganisation.trim().length == 0) {
        return { success: false, errors: [ 'The organisation is mandatary.' ]};
    }

    var metadata = {
        name: $dataset_key,
        title: $dataset_title,
        notes: $dataset_description,
        description: $dataset_description,
        author: $contact_name,
        author_email: $contact_email,
        maintainer: $dataset_maintainer,
        maintainer_email: $dataset_maintainer_email,
        version: $dataset_version,
        language: $dataset_language_id,
        url: $dataset_origin,
        owner_org: $deforganisation,
        license_id: $dataset_license_id
    };

    for (var k in metadata){
        var value = metadata[k];
        var _msgErrorKey = k + "_message";

        if (_msgErrors.hasOwnProperty(_msgErrorKey) && typeof value != 'undefined' && value.trim().length == 0) {
            var msg = _msgErrors[_msgErrorKey];
            return { success: false, errors: [ msg ] };
        }
    }

    return { success: true, metadata: metadata };
};//EndFunction.

room.uploadOnCkan = async function (_jsonData, _jsonCocreationMetadata, notes, callbackUpload) {

    var fileCSVData;

    try {
        fileCSVData = await room.getSheetCSVFileInstance();
    } catch (e) {
        debugger;
        callbackUpload({ success: false, errors: [ "Cannot download CSV file from Ethersheet.  Ethersheet Internal Error." ] });
        return;
    }

    //Cocreation notes.
    var fileNotes = null;
    if (notes != null)
        fileNotes = new File([notes.content], notes.filename + "." + notes.format, { type: notes.content_type });

    var result = this.prepareMetadataForCKAN(_jsonCocreationMetadata);
    if (!result.success) {
        callbackUpload(result);
        return;
    }

    var metadata = result.metadata;

    //Create the package on CKAN.
    const $platformUrl = COCREATION.ckan_platform_url_preference;
    const $keyapi = COCREATION.ckan_api_key_preference;

    var client = new CKANClient($platformUrl, $keyapi);

    client.createPackage(metadata, function (response, err) {
        if (err != null) {
            var _jsonError = JSON.parse(response);
            var _errors = room.processCkanErrorMessage(_jsonError);

            if (typeof callbackUpload !== 'undefined')
                callbackUpload({ success: false, errors: _errors });
            return;
        }

        //Create the resource.
        var _json = JSON.parse(response);
        var package_id = _json.result.id;

        //Changes metadata to adapt them for the
        //metadata.name =  $dataset_title;

        //Upload CSV FILE.
        client.createResourceCSV(package_id, fileCSVData, metadata, function (response, err) {
            var uploadedPackageId = JSON.parse(response).result.id;
            if (err != null) {
                var _jsonError = JSON.parse(response);
                var _errors = room.processCkanErrorMessage(_jsonError);

                callbackUpload({ success: false, errors: _errors, package: { id: uploadedPackageId } });
                return;
            } else {
                if (notes == null)
                    callbackUpload({ success: true, package_id: package_id });

                //Upload the NOTES.
                if (notes != null) {
                    var notesMetadata = JSON.parse(JSON.stringify(metadata)); //Clone metadata.
                    notesMetadata.name = notes.filename;
                    notesMetadata.format = notes.format;
                    notesMetadata.description = "Co-creation notes";
                    client.createResource(package_id, fileNotes, notesMetadata, function (response, err) {
                        var uploadedPackageId = JSON.parse(response).result.id;
                        if (err != null) {
                            var _jsonError = JSON.parse(response);
                            var _errors = _jsonError.error.name;
                            callbackUpload({ success: false, errors: _errors, package: { id: uploadedPackageId } });
                        } else
                            callbackUpload({ success: true, package_id: package_id });
                    });//EndCreateResource.
                }
            }//EndIf.
        });//EndCreateResource.

    });//EndCreatePackage.
};//EndFunction.

room.processCkanErrorMessage = function (_jsonResponse) {
    var _errors = "";

    if (typeof _jsonResponse.error !== 'undefined' && typeof _jsonResponse.error.name !== 'undefined')
        _errors += _jsonResponse.error.name;

    if (typeof _jsonResponse.error !== 'undefined' && typeof _jsonResponse.error.message !== 'undefined')
        _errors += _jsonResponse.error.message;

    //Selects the other possible error messages in the response.
    for (var property in _jsonResponse.error) {
        if (_jsonResponse.error.hasOwnProperty(property)) {
            if (property === '__type') continue;
            if (property === 'message') continue;
            if (property === 'name') continue;

            _errors +=  "(" + property + ":" + _jsonResponse.error[property] + ")\n";
        }
    }

    return _errors;
};//EndFunction.

//////////////////////////////////////////////////////////////////////////////