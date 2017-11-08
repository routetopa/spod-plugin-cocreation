<?php
require_once OW::getPluginManager()->getPlugin('spodnotification')->getRootDir()
    . 'lib/vendor/autoload.php';

use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version1X;

ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

class COCREATION_CTRL_Ajax extends OW_ActionController
{
    public function createRoom(){
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        $room = COCREATION_BOL_Service::getInstance()->addRoom(
            OW::getUser()->getId(),
            $clean['name'],
            $clean['subject'],
            $clean['description'],
            $clean['data_from'],
            $clean['data_to'],
            $clean['goal'],
            $clean['invitation_text'],
            empty($clean['is_open']) ? 0 : 1,
            implode("#######", $clean['users_value']),
            $clean['room_type']
        );

        $randomString = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 5);

        if($clean['room_type'] == "knowledge")
        {
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 0, "explore", "explore_room_" .$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 1, "ideas",   "ideas_room_"   .$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 2, "outcome", "outcome_room_" .$room->id."_".$randomString);
        }else{
            //create the sheet for the CoCreation Data room
            //Document for notes related to the dataset
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 1, "notes", "notes_room_"  .$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->addSheetToRoom($room->id, "dataset", "dataset_room_".$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->createMetadataForRoom($room->id);

            if($clean['room_type'] == "media")
                $this->initEthersheetMediaRoom("dataset_room_".$room->id."_".$randomString);
        }

        //Send message to all members
        foreach($clean['users_value'] as $user)
        {
            $u = BOL_UserService::getInstance()->findByEmail($user);
            if($u->id != NULL) {
                if(!COCREATION_BOL_Service::getInstance()->isMemberInvitedToRoom($u->id, $room->id)) {
                    COCREATION_BOL_Service::getInstance()->addUserToRoom($room->id, $user, $u->id);
                    $js = "$.post('" .
                        OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'confirmToJoinToRoom') . "?roomId=" . $room->id . "&memberId=" . $u->id . "',
                            {}, function (data, status) {
                               window.location ='" .
                        str_replace("index/", $room->id, OW::getRouter()->urlFor($room->type == "knowledge" ? 'COCREATION_CTRL_KnowledgeRoom' : 'COCREATION_CTRL_DataRoom', 'index')) . "';});";

                    $message = $clean['invitation_text'] . "<br><br>" . "<span class=\"ow_button\"><input type=\"button\" value=\"Conform to join\" onclick=\"" . $js . "\"></span>";
                    if (OW::getPluginManager()->isPluginActive('mailbox'))
                        MAILBOX_BOL_ConversationService::getInstance()->createConversation(OW::getUser()->getId(), $u->id, "Join to co-creation room : " . $clean['name'], $message);
                }else{
                    OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_member_already_added'));
                }
            }
        }

        COCREATION_CLASS_EventHandler::getInstance()->sendNotificationRoomCreated($room);

        OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_create_room_successful'));
        OW::getApplication()->redirect(OW::getRouter()->urlFor('COCREATION_CTRL_Main', 'index'));
    }

    public function deleteRoom(){
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->deleteRoomById($clean['roomId']);
        OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_delete_room_successful'));
        echo json_encode(array("status" => "ok", "message" => "dataset successful created in the current room"));
        SPODNOTIFICATION_CLASS_EventHandler::getInstance()->emitNotification(["plugin" => "cocreation",
            "operation" => "deleteRoom",
            "entity_type" => COCREATION_BOL_Service::ROOM_ENTITY_TYPE,
            "entity_id" => $clean['roomId']]);
        exit;
    }

    public function addNewMembersToRoom(){
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        $room = COCREATION_BOL_Service::getInstance()->getRoomById($clean['roomId']);
        foreach($clean['users_value'] as $user){
            $u   = BOL_UserService::getInstance()->findByEmail($user);
            if(!COCREATION_BOL_Service::getInstance()->isMemberInvitedToRoom($u->id, $room->id)) {
                if (!COCREATION_BOL_Service::getInstance()->isMemberJoinedToRoom($u->id, $room->id)) {
                    COCREATION_BOL_Service::getInstance()->addUserToRoom($room->id, $user, $u->id);
                    $js = "$.post('" .
                        OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'confirmToJoinToRoom') . "?roomId=" . $room->id . "&memberId=" . $u->id . "',
                        {}, function (data, status) {
                           window.location ='" .
                        str_replace("index/", $room->id, OW::getRouter()->urlFor($room->type == "knowledge" ? 'COCREATION_CTRL_KnowledgeRoom' : 'COCREATION_CTRL_DataRoom', 'index')) . "';});";

                    $message = $room->invitationText . "<br><br>" . "<span class=\"ow_button\"><input type=\"button\" value=\"Confirm to join\" onclick=\"" . $js . "\"></span>";
                    if (OW::getPluginManager()->isPluginActive('mailbox'))
                        MAILBOX_BOL_ConversationService::getInstance()->createConversation(OW::getUser()->getId(), $u->id, "Join to co-creation room : " . $room->name, $message);

                    COCREATION_CLASS_EventHandler::getInstance()->sendNotificationRoomInvitation($room, $u->id);

                }
            }else{
                OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_member_already_added'));
            }
        }

        OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_members_add_successful'));
        $this->redirect(str_replace("index/", $room->id, $room->type == "knowledge" ? OW::getRouter()->urlFor('COCREATION_CTRL_KnowledgeRoom', 'index') : OW::getRouter()->urlFor('COCREATION_CTRL_DataRoom', 'index') ));
    }

    public function deleteMemberFromRoom()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null) {
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_inputs_detected'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->deleteMembersFromRoom($clean['userId']);

        SPODNOTIFICATION_CLASS_EventHandler::getInstance()->emitNotification([
            "plugin"      => "cocreation",
            "operation"   => "deleteUser",
            "user_name"   => BOL_AvatarService::getInstance()->getDataForUserAvatars(array($clean['userId']))[$clean['userId']]['title'],
            "entity_type" => COCREATION_BOL_Service::ROOM_ENTITY_TYPE]);
        echo json_encode(array("status" => "ok", "message" => "users has been deleted from this room"));
        OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_delete_room_user'));
        //$this->redirect(str_replace("index/", $clean['roomId'], $clean['roomType'] == "knowledge" ? OW::getRouter()->urlFor('COCREATION_CTRL_KnowledgeRoom', 'index') : OW::getRouter()->urlFor('COCREATION_CTRL_DataRoom', 'index') ));
        exit;
    }

    public function addDatasetToRoom()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->addDatasetToRoom($clean['roomId'],
                                                                $clean['dataUrl'],
                                                                $clean['datasetName'],
                                                                $clean['datasetDescription'],
                                                                $clean['datasetFields']);


        echo json_encode(array("status" => "ok", "message" => "dataset successful created in the current room"));
        SPODNOTIFICATION_CLASS_EventHandler::getInstance()->emitNotification(["plugin"      => "cocreation",
                                                                              "operation"   => "addDatasetToRoom",
                                                                              "entity_type" => COCREATION_BOL_Service::ROOM_ENTITY_TYPE,
                                                                              "entity_id"   => $clean['roomId']]);
        exit;

    }

    public function getDatasetsForRoom(){
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }
        $datasets = COCREATION_BOL_Service::getInstance()->getDatasetsByRoomId($clean['roomId']);

        $suggested_datasets = array();
        foreach($datasets as $dataset){
            $d = new stdClass();
            $metas = new stdClass();
            $metas->description = $dataset->description;

            $d->resource_name =  $dataset->name;
            $d->url           =  $dataset->url;
            $d->metas         =  json_encode($metas);
            array_push($suggested_datasets, $d);
        }

        echo json_encode(array("status" => "ok", "suggested_datasets" => json_encode($suggested_datasets)));
        exit;
    }

    public function addDataletToRoom(){

        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        if( ODE_CLASS_Helper::validateDatalet($clean['component'], $clean['params'], $clean['fields']) )
        {
            $datalet = ODE_BOL_Service::getInstance()->saveDatalet(
                $clean['component'],
                $clean['fields'],
                OW::getUser()->getId(),
                $clean['params'],
                $clean['data']);

            COCREATION_BOL_Service::getInstance()->addDataletToRoom($clean['roomId'], $datalet->id);

            $datalets = COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($clean['roomId']);
            $room_datalets = array();
            foreach($datalets as $d){
                $datalet         =  ODE_BOL_Service::getInstance()->getDataletById($d->dataletId);
                $datalet->params = json_decode($datalet->params);
                $datalet->data   = str_replace("'","&#39;", $datalet->data);
                $datalet->fields = str_replace("'","&#39;", $datalet->fields);

                $datalet_string = "<" . $datalet->component . " datalet-id='". $datalet->id ."' fields='[" . rtrim(ltrim($datalet->fields, "}"), "{") . "]'";
                foreach($datalet->params as $key => $value)
                    $datalet_string .= " " . $key . "='" . $value . "'";
                $datalet_string .= "></" . $datalet->component . ">";

                array_push($room_datalets, $datalet_string);
            }

            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_add_datalet_successful'));
            echo json_encode(array("status" => "ok", "message" => "datalet successful created in the current room", "dataletId" => $datalet->id));
            SPODNOTIFICATION_CLASS_EventHandler::getInstance()->emitNotification(["plugin"      => "cocreation",
                                                                                  "operation"   => "addDataletToRoom",
                                                                                  "entity_type" => COCREATION_BOL_Service::ROOM_ENTITY_TYPE,
                                                                                  "entity_id"   => $clean['roomId'],
                                                                                  "user_id"     => OW::getUser()->getId(),
                                                                                  "datalets"    => $room_datalets]);
            exit;
        }else{
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_add_datalet_fail'));
            echo json_encode(array("status" => "error", "message" => "There are some problems with selected parameters for current datalet"));
            exit;
        }
    }

    public function deleteDataletFromRoom(){
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->deleteDataletFromRoom($clean['roomId'], $clean['dataletId']);
        $datalets = COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($clean['roomId']);
        $room_datalets = array();
        foreach($datalets as $d){
            $datalet         =  ODE_BOL_Service::getInstance()->getDataletById($d->dataletId);
            $datalet->params = json_decode($datalet->params);
            $datalet->data   = str_replace("'","&#39;", $datalet->data);
            $datalet->fields = str_replace("'","&#39;", $datalet->fields);

            $datalet_string = "<" . $datalet->component . " datalet-id='". $datalet->id ."' fields='[" . rtrim(ltrim($datalet->fields, "}"), "{") . "]'";
            foreach($datalet->params as $key => $value)
                $datalet_string .= " " . $key . "='" . $value . "'";
            $datalet_string .= "></" . $datalet->component . ">";

            array_push($room_datalets, $datalet_string);
        }

        OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_delete_datalet_successful'));
        echo json_encode(array("status" => "ok", "message" => "datalet successful deleted in the current room"));
        SPODNOTIFICATION_CLASS_EventHandler::getInstance()->emitNotification(["plugin"           => "cocreation",
                                                                              "operation"        => "deleteDataletFromRoom",
                                                                              "entity_type"      => COCREATION_BOL_Service::ROOM_ENTITY_TYPE,
                                                                              "entity_id"        => $clean['roomId'],
                                                                              "user_id"          => OW::getUser()->getId(),
                                                                              "deleted_position" => $clean['deletedPosition'],
                                                                              "datalets"         => $room_datalets]);
        exit;
    }

    public function addPostitToDatalet()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->addPostitToDataletInRoom(
            $clean['roomId'],
            $clean['dataletId'],
            $clean['title'],
            $clean['content']);

        $datalet_postits = COCREATION_BOL_Service::getInstance()->getPostitByDataletId($clean['dataletId']);

        SPODNOTIFICATION_CLASS_EventHandler::getInstance()->emitNotification(["plugin"      => "cocreation",
                                 "operation"   => "addPostitToDatalet",
                                 "postits"     => json_encode($datalet_postits),
                                 "dataletId"   => $clean['dataletId'],
                                 "entity_type" => COCREATION_BOL_Service::ROOM_ENTITY_TYPE,
                                 "entity_id"   => $clean['roomId']]);
        exit;
    }

    public function getRoomDatalets()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        $datalets = COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($clean['roomId']);
        $room_datalets = array();
        foreach($datalets as $d){
            $datalet         =  ODE_BOL_Service::getInstance()->getDataletById($d->dataletId);
            $datalet->params = json_decode($datalet->params);
            $datalet->data   = str_replace("'","&#39;", $datalet->data);
            $datalet->fields = str_replace("'","&#39;", $datalet->fields);

            $datalet_string = "<" . $datalet->component . " datalet-id='". $datalet->id ."' fields='[" . rtrim(ltrim($datalet->fields, "}"), "{") . "]'";
            foreach($datalet->params as $key => $value)
                $datalet_string .= " " . $key . "='" . $value . "'";
            $datalet_string .= "></" . $datalet->component . ">";

            array_push($room_datalets, $datalet_string);
        }

        /*$datalets = COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($clean['roomId']);
        $room_datalets = array();
        foreach($datalets as $d){
            $datalet         = ODE_BOL_Service::getInstance()->getDataletById($d->dataletId);
            $datalet->params = json_decode($datalet->params);
            $datalet->data   = htmlspecialchars($datalet->data);
            $datalet->fields = htmlspecialchars($datalet->fields);
            array_push($room_datalets, $datalet);
        }*/

        echo json_encode(array("status" => "ok", "datalets" => $room_datalets));
        exit;
    }

    public function confirmToJoinToRoom()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->memberJoinToRoom($clean['memberId'], $clean['roomId']);
    }

    public function getSheetData(){

        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreationes', 'insane_values'));
            exit;
        }
        echo json_encode(COCREATION_BOL_Service::getInstance()->getSheetData($clean['sheetName']));
        exit;
    }

    public function getArrayOfObjectSheetData(){

        //ser cors header
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreationes', 'insane_values'));
            exit;
        }

        header("Access-Control-Allow-Origin: *");
        echo json_encode(COCREATION_BOL_Service::getInstance()->getArrayOfObjectSheetData($clean['sheetName']));
        exit;
    }

    public function updateMetadata()
    {
        $clean = $_REQUEST;//ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        if(COCREATION_BOL_Service::getInstance()->updateMetadata(
                $clean['roomId'],
                $clean['core_common_required_metadata'],
                $clean['common_core_if_applicable_metadata'],
                $clean['expanded_metadata']))
        {

            echo json_encode(array("status" => "ok", "message" => "metadata sucessfully update for current room"));

            SPODNOTIFICATION_CLASS_EventHandler::getInstance()->emitNotification(["plugin" => "cocreation",
                                     "operation"                          => "updateMetadata",
                                     "core_common_required_metadata"      => $clean['core_common_required_metadata'],
                                     "common_core_if_applicable_metadata" => $clean['common_core_if_applicable_metadata'],
                                     "expanded_metadata"                  => $clean['expanded_metadata'],
                                     "entity_type" => COCREATION_BOL_Service::ROOM_ENTITY_TYPE,
                                     "entity_id"   => $clean['roomId']
            ]);
        }else
           echo json_encode(array("status" => "error", "message" => "error in sql syntax"));
        exit;

    }

    public function publishDataset()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->addDataset($clean['roomId'],
                                                          $clean['owners'],
                                                          $clean['datasetId'],
                                                          $clean['data'],
                                                          $clean['notes'],
                                                          $clean['common_core_required_metadata'],
                                                          $clean['common_core_if_applicable_metadata'],
                                                          $clean['expanded_metadata']);


        $room = COCREATION_BOL_Service::getInstance()->getRoomById($clean['roomId']);
        $common_core_required_metadata = json_decode($clean['common_core_required_metadata']);


        $resource_name = "";
        if($common_core_required_metadata->title != "")
        {
            $resource_name = $common_core_required_metadata->title;
        }
        else if(count($room) > 0)
        {
            $resource_name = $room->name;
        }
        else
        {
            $resource_name = $clean['datasetId'];
        }

        COCREATION_CLASS_EventHandler::getInstance()->sendNotificationDatasetPublished($resource_name);


        exit;
    }

    function getNoteHTMLByPadIDApiUrl() {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        try {
            $document_server_port_preference = BOL_PreferenceService::getInstance()->findPreference('document_server_port_preference');

            //$apiurl = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'] . ":".$document_server_port_preference->defaultValue."/api/1/getHTML?apikey=e20a517df87a59751b0f01d708e2cb6496cf6a59717ccfde763360f68a7bfcec&padID=" . explode("/", $clean['noteUrl'])[4];
            $apiurl = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'] . "/etherpad" . "/api/1/getHTML?apikey=e20a517df87a59751b0f01d708e2cb6496cf6a59717ccfde763360f68a7bfcec&padID=" .$clean['noteUrl'];
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $apiurl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            curl_close($ch);
            $result = json_decode($result);
            if($result->message == "ok")
                echo json_encode(array("status" => "ok", "data" => $result->data->html));
            else
                echo json_encode(array("status" => "error", "message" => "error getting note content"));

        }catch(Exception $e){
            echo json_encode(array("status" => "error", "message" => "error getting note content"));
        }finally{
            exit;
        }
    }

    public function getDatasetById()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        header("Access-Control-Allow-Origin: *");
        $dataset = COCREATION_BOL_Service::getInstance()->getDatasetById($clean['id']);

        $dataset->owners = substr($dataset->owners, 1, -1);
        $dataset->owners = str_replace('\\', "", $dataset->owners);
        $users = json_decode($dataset->owners);
        $avatars = array();

        foreach ($users as $user)
        {
            $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user));
            $avatars[] = array("src" => $avatar[$user]["src"], "href" => $avatar[$user]["url"], "user" => $avatar[$user]["title"]);
        }

        $room = COCREATION_BOL_Service::getInstance()->getRoomById($dataset->roomId);

        echo json_encode(array('resourceUrl' => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getDatasetByRoomIdAndVersion') . "?room_id=" . $dataset->roomId . "&version=" . $dataset->version,
            "users"=>$avatars,
            "metas"=>$dataset->common_core_required_metadata,
            "roomName" => $room->name ? $room->name : OW::getLanguage()->text('cocreation', 'deteted_room')));
        exit;
    }

    public function getDatasetByRoomIdAndVersion()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        header("Access-Control-Allow-Origin: *");
        echo COCREATION_BOL_Service::getInstance()->getDatasetByRoomIdAndVersion($clean['room_id'], $clean['version'])->data;
        exit;
    }

    public function getDatasetDocByRoomIdAndVersion()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        header("Access-Control-Allow-Origin: *");
        $notes = COCREATION_BOL_Service::getInstance()->getDatasetByRoomIdAndVersion($clean['room_id'], $clean['version'])->notes;
        $notes = json_decode($notes);
        echo $notes->data;
        exit;
    }

    public function getAllDataset()
    {
        $datasets = COCREATION_BOL_Service::getInstance()->getAllDatasets();
        $data = array();

        foreach ($datasets as $dataset)
        {
            /*$dataset->owners = substr($dataset->owners, 1, -1);
            $dataset->owners = str_replace('\\', "", $dataset->owners);
            $users = json_decode($dataset->owners);
            $avatars = array();

            foreach ($users as $user)
            {
                $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user));
                $avatars[] = array("src" => $avatar[$user]["src"], "href" => $avatar[$user]["url"], "user" => $avatar[$user]["title"]);
            }
            */
            $room = COCREATION_BOL_Service::getInstance()->getRoomById($dataset->roomId);
            $common_core_required_metadata = json_decode($dataset->common_core_required_metadata);

            if($common_core_required_metadata->title != "")
            {
                $resource_name = $common_core_required_metadata->title;
            }
            else if(count($room) > 0)
            {
                $resource_name = $room->name;
            }
            else
            {
                $resource_name = $dataset->datasetId;
            }

            $data[] = array(
                'name' => $resource_name,
                'id' => $dataset->id,
                'p' => 'SPOD_X',
                'version' => $dataset->version
            );

        }

        header("Access-Control-Allow-Origin: *");
        echo json_encode($data);
        exit;
    }

    /* Mobile app service */
    public function getMediaRoomsByUserId()
    {
        /*if ( !OW::getUser()->isAuthenticated() )
        {
            throw new AuthenticateException();
        }*/

        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            exit;
        }

        $user_rooms = array();
        $rooms = COCREATION_BOL_Service::getInstance()->getAllRooms();
        foreach ($rooms as $room) {
            if ((COCREATION_BOL_Service::getInstance()->isMemberJoinedToRoom($clean['userId'], $room->id) ||
                $clean['userId'] == intval($room->ownerId)) && $room->type == "media")
            {
                $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($room->ownerId))[$room->ownerId];
                $room->ownerImage = $avatar['src'];
                $room->ownerName  = $avatar['title'];
                $room->sheetId = COCREATION_BOL_Service::getInstance()->getSheetByRoomId($room->id)[0]->url;
                array_push($user_rooms, $room);
            }
        }

        header("Access-Control-Allow-Origin: *");
        //echo json_encode(array("status" => "ok", "data" => $user_rooms));
        echo json_encode($user_rooms);
        exit;
    }

    public function getCocreationRoomsByUserId()
    {
        /*if ( !OW::getUser()->isAuthenticated() )
        {
            throw new AuthenticateException();
        }*/

        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            exit;
        }

        $user_rooms = array();
        $rooms = COCREATION_BOL_Service::getInstance()->getAllRooms();
        foreach ($rooms as $room) {
            if ((COCREATION_BOL_Service::getInstance()->isMemberJoinedToRoom($clean['userId'], $room->id) ||
                    $clean['userId'] == intval($room->ownerId)))
            {
                $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($room->ownerId))[$room->ownerId];
                $room->ownerImage = $avatar['src'];
                $room->ownerName  = $avatar['title'];
                $room->sheetId = COCREATION_BOL_Service::getInstance()->getSheetByRoomId($room->id)[0]->url;

                $room->docs = COCREATION_BOL_Service::getInstance()->getDocumentsByRoomId($room->id);

                array_push($user_rooms, $room);
            }
        }

        header("Access-Control-Allow-Origin: *");
        echo json_encode($user_rooms);
        exit;
    }

    public function getSheetDataByRoomId(){
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            exit;
        }

        $sheetName = COCREATION_BOL_Service::getInstance()->getSheetByRoomId($clean['roomId'])[0]->url;

        header("Access-Control-Allow-Origin: *");
        echo json_encode(COCREATION_BOL_Service::getInstance()->getArrayOfObjectSheetData($sheetName));
        exit;
    }

    public function getUserInfo()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null) {
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            exit;
        }

        if (isset($clean['email'])) {
            $user = BOL_UserService::getInstance()->findByEmail($clean['email']);
        }else{
            $user = BOL_UserService::getInstance()->findByUsername($clean['username']);
        }

        $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user->id))[$user->id];

        $u = new stdClass();
        $u->id       = $user->id;
        $u->username = $avatar['urlInfo']['vars']['username'];
        $u->name     = $avatar['title'];
        $u->image    = $avatar['src'];

        echo json_encode(array("status" => true, "user" => json_encode($u)));
        exit;

    }

    function initEthersheetMediaRoom($collectionId) {
        try {
            //create the sheet first
            $url = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'] . "/ethersheet/s/".$collectionId;
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);

            //generate the headers for media room
            $apiurl = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'] . "/ethersheet/mediaroom/init/" . $collectionId;
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $apiurl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: text/html; charset=utf-8; application/x-www-form-urlencoded'
            ));
            curl_setopt($ch, CURLOPT_POSTFIELDS,
                "collection_id=".$collectionId);

            $result = curl_exec($ch);
            curl_close($ch);
            $result = json_decode($result);
            return $result;
        }catch(Exception $e){
            return null;
        }finally{
            return null;
        }
    }

    public function createMediaRoomFromMobile(){
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            echo json_encode(array("status" => false, "message" => 'Insane inputs detected'));
            exit;
        }
        try{
            $room = COCREATION_BOL_Service::getInstance()->addRoom(
                $clean['ownerId'],
                $clean['name'],
                $clean['subject'],
                $clean['description'],
                $clean['data_from'],
                $clean['data_to'],
                $clean['goal'],
                $clean['invitation_text'],
                empty($clean['is_open']) ? 0 : 1,
                implode("#######", $clean['users_value']),
                $clean['room_type']
            );

            $randomString = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 5);


            //create the sheet for the CoCreation Data room
            //Document for notes related to the dataset
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 1, "notes", "notes_room_"  .$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->addSheetToRoom($room->id, "dataset", "dataset_room_".$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->createMetadataForRoom($room->id);

            $result = $this->initEthersheetMediaRoom("dataset_room_".$room->id."_".$randomString);

            COCREATION_CLASS_EventHandler::getInstance()->sendNotificationRoomCreated($room);

            echo json_encode(array("status" => true, "message" => 'room created'));
            exit;

        }catch (exception $e){
            echo json_encode(array("status" => false, "message" => $e->getMessage()/*'Something went wrong, please check the form values!'*/));
            exit;
        }
    }

    public function getMetadataByRoomId()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null) {
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            exit;
        }

        $metadata = COCREATION_BOL_Service::getInstance()->getMetadataByRoomId($clean['roomId']);

        $metadataObj = new stdClass();
        $metadataObj->CC_RF = json_decode($metadata[0]->common_core_required);
        $metadataObj->CC_RAF = json_decode($metadata[0]->common_core_if_applicable);
        $metadataObj->EF = json_decode($metadata[0]->expanded);

        echo json_encode(array("status" => true, "metadata" => $metadataObj));
        exit;
    }

    public function getDataletsByRoomId()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null) {
            echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));
            exit;
        }

        $datalets = COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($clean['roomId']);
        $room_datalets = array();
        foreach($datalets as $d) {
            $datalet = ODE_BOL_Service::getInstance()->getDataletById($d->dataletId);
            $datalet->params = json_decode($datalet->params);
            $datalet->data = str_replace("'", "&#39;", $datalet->data);
            $datalet->fields = str_replace("'", "&#39;", $datalet->fields);

            $datalet_string = "<" . $datalet->component . " datalet-id='" . $datalet->id . "' disable_my_space";
            foreach ($datalet->params as $key => $value)
                $datalet_string .= " " . $key . "='" .  str_replace("\"", "\\\"", $value ) . "'";
            $datalet_string .= "></" . $datalet->component . ">";

            array_push($room_datalets, $datalet_string);
        }

        echo json_encode(array("status" => true, "datalets" => $room_datalets, "datalets_definition" => ODE_CLASS_Tools::getInstance()->get_all_datalet_definitions()));
        exit;
    }

}