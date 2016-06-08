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
            implode(" ", $clean['users_value']),
            $clean['room_type']
        );

        $randomString = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 5);

        if($clean['room_type'] == "knowledge")
        {
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 0, "explore", rtrim(OW_URL_HOME,"/")  . ":9001" . "/p/explore_room_" .$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 1, "ideas",   rtrim(OW_URL_HOME,"/") . ":9001" . "/p/ideas_room_"   .$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 2, "outcome", rtrim(OW_URL_HOME,"/") . ":9001" . "/p/outcome_room_" .$room->id."_".$randomString);
        }else{
            //create the sheet for the CoCreation Data room
            //Document for notes related to the dataset
            COCREATION_BOL_Service::getInstance()->addDocToRoom($room->id, 1, "notes",  rtrim(OW_URL_HOME,"/")   . ":9001" . "/p/notes_room_"  .$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->addSheetToRoom($room->id, "dataset", rtrim(OW_URL_HOME,"/")   . ":8001" . "/s/dataset_room_".$room->id."_".$randomString);
            COCREATION_BOL_Service::getInstance()->createMetadataForRoom($room->id);
        }

        //Send message to all members
        foreach($clean['users_value'] as $user)
        {
            $u = BOL_UserService::getInstance()->findByEmail($user);
            if($u->id != NULL) {
                COCREATION_BOL_Service::getInstance()->addUserToRoom($room->id, $user, $u->id);
                $js = "$.post('" .
                    OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'confirmToJoinToRoom') . "?roomId=" . $room->id . "&memberId=" . $u->id . "',
                        {}, function (data, status) {
                           window.location ='" .
                    str_replace("index/", $room->id, OW::getRouter()->urlFor('COCREATION_CTRL_KnowledgeRoom', 'index')) . "';});";

                $message = $clean['invitation_text'] . "<br><br>" . "<span class=\"ow_button\"><input type=\"button\" value=\"Conform to join\" onclick=\"" . $js . "\"></span>";
                if (OW::getPluginManager()->isPluginActive('mailbox'))
                   MAILBOX_BOL_ConversationService::getInstance()->createConversation(OW::getUser()->getId(), $u->id, "Join to co-creation room : " . $clean['name'], $message);
            }
        }

        OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_create_room_successful'));
        OW::getApplication()->redirect(OW::getRouter()->urlFor('COCREATION_CTRL_Main', 'index'));
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
            COCREATION_BOL_Service::getInstance()->addUserToRoom($room->id, $user, $u->id);
            $js="$.post('" .
                OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'confirmToJoinToRoom') . "?roomId=". $room->id . "&memberId=" . $u->id . "',
                {}, function (data, status) {
                   window.location ='".
                str_replace("index/", $room->id, OW::getRouter()->urlFor('COCREATION_CTRL_KnowledgeRoom', 'index')) ."';});";

            $message = $room->invitationText . "<br><br>" . "<span class=\"ow_button\"><input type=\"button\" value=\"Confirm to join\" onclick=\"" . $js ."\"></span>";
            if (OW::getPluginManager()->isPluginActive('mailbox'))
               MAILBOX_BOL_ConversationService::getInstance()->createConversation(OW::getUser()->getId(), $u->id, "Join to co-creation room : " . $room->name , $message);
        }

        OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_members_add_successful'));
        $this->redirect(str_replace("index/", $room->id, OW::getRouter()->urlFor('COCREATION_CTRL_KnowledgeRoom', 'index')));
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
        $this->emitNotification(["plugin" => "cocreation", "operation" => "addDatasetToRoom", "entity_type" => COCREATION_BOL_Service::ROOM_ENTITY_TYPE, "entity_id" => $clean['roomId']]);
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

        $suggested_datasets_string = '[';
        foreach($datasets as $dataset) $suggested_datasets_string .= '{"name":"' . $dataset->name .'","url": "' . $dataset->url .'","description" : "' . $dataset->name .'"},';
        $suggested_datasets_string = rtrim($suggested_datasets_string, ",") . ']';

        echo json_encode(array("status" => "ok", "suggested_datasets" => $suggested_datasets_string));
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
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_add_datalet_successful'));
            echo json_encode(array("status" => "ok", "message" => "datalet successful created in the current room", "dataletId" => $datalet->id));
            $this->emitNotification(["plugin" => "cocreation", "operation" => "addDataletToRoom", "entity_type" => COCREATION_BOL_Service::ENTITY_TYPE, "entity_id" => $clean['roomId']]);
            exit;
        }else{
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'feedback_add_datalet_fail'));
            echo json_encode(array("status" => "error", "message" => "There are some problems with selected parameters for current datalet"));
            exit;
        }
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

        $this->emitNotification(["plugin"      => "cocreation",
                                 "operation"   => "addPostitToDatalet",
                                 "postits"     => json_encode($datalet_postits),
                                 "dataletId"   => $clean['dataletId'],
                                 "entity_type" => COCREATION_BOL_Service::ENTITY_TYPE,
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
            $datalet         = ODE_BOL_Service::getInstance()->getDataletById($d->dataletId);
            $datalet->params = json_decode($datalet->params);
            $datalet->data   = htmlspecialchars($datalet->data);
            $datalet->fields = htmlspecialchars($datalet->fields);
            array_push($room_datalets, $datalet);
        }

        echo json_encode(array("status" => "ok", "datalets" => json_encode($room_datalets)));
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

        COCREATIONEP_BOL_Service::getInstance()->memberJoinToRoom($clean['memberId'], $clean['roomId']);
    }

    private function emitNotification($map){
        try
        {
            $client = new Client(new Version1X('http://localhost:3000'));
            $client->initialize();
            $client->emit('realtime_notification', $map);
            $client->close();
        }
        catch(Exception $e)
        {}
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

        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            OW::getFeedback()->info(OW::getLanguage()->text('cocreationes', 'insane_values'));
            exit;
        }
        echo json_encode(COCREATION_BOL_Service::getInstance()->getArrayOfObjectSheetData($clean['sheetName']));
        exit;
    }

    public function updateMetadatas()
    {
        $clean = ODE_CLASS_InputFilter::getInstance()->sanitizeInputs($_REQUEST);
        if ($clean == null){
            /*echo json_encode(array("status" => "error", "massage" => 'Insane inputs detected'));*/
            OW::getFeedback()->info(OW::getLanguage()->text('cocreation', 'insane_user_email_value'));
            exit;
        }

        COCREATION_BOL_Service::getInstance()->updateMetadatas($clean['roomId'],
                                                               $clean['core_common_required_metadatas'],
                                                               $clean['common_core_if_applicable_metadatas'],
                                                               $clean['expanded_metadatas']);


        echo json_encode(array("status" => "ok", "message" => "metadatas sucessfully update for current room"));
        exit;

    }

}