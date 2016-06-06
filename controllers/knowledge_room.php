<?php

class COCREATION_CTRL_KnowledgeRoom extends OW_ActionController
{

    function getOutcomeReadonlyPadID($url) {
        try {
            $apiurl = rtrim(OW_URL_HOME, "/") . ":9001/api/1/getReadOnlyID?apikey=e20a517df87a59751b0f01d708e2cb6496cf6a59717ccfde763360f68a7bfcec&padID=" . explode("/", $url)[4];
            $ch = curl_init();
            // you should put here url of your getinfo.php script
            curl_setopt($ch, CURLOPT_URL, $apiurl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            curl_close($ch);
            $result = json_decode($result);
            return rtrim(OW_URL_HOME, "/") . ":9001/ro/" . $result->data->readOnlyID;
        }catch(Exception $e){
            return $url;
        }
    }

    public function index(array $params)
    {
        OW::getDocument()->addStyleSheet(OW::getPluginManager()->getPlugin('cocreation')->getStaticUrl()              . 'css/cocreation-room.css');
        OW::getDocument()->addStyleSheet(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl()            . 'perfect-scrollbar/css/perfect-scrollbar.min.css');

        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl()                . 'cocreation.js', 'text/javascript');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl()                . 'masonry.pkgd.min.js', 'text/javascript');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl()                . 'cocreation-knowledge.js', 'text/javascript');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl()                . 'perfect-scrollbar/js/min/perfect-scrollbar.jquery.min.js', 'text/javascript');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticUrl()                  . 'components/js/' . 'dataletsSlider.js', 'text/javascript');
        OW::getDocument()->getMasterPage()->setTemplate(OW::getPluginManager()->getPlugin('cocreation')->getRootDir() . 'master_pages/general.html');

        if ( isset($params['roomId'])){

            if(COCREATION_BOL_Service::getInstance()->isMemberJoinedToRoom(OW::getUser()->getId(), intval($params['roomId'])))
               $this->assign('isMember',true);
            else
                $this->assign('isMember',false);

            //Set info for current co-creation room
            $room = COCREATION_BOL_Service::getInstance()->getRoomById($params['roomId']);
            $this->assign('owner', BOL_AvatarService::getInstance()->getDataForUserAvatars(array($room->ownerId))[$room->ownerId]);

            if(intval($room->ownerId) == OW::getUser()->getId()) {
                $this->assign('ownerUserActive', true);
                $this->assign('isMember', true);
            }else
                $this->assign('ownerUserActive', false);

            $this->assign('room', $room);

            //Get room members
            $room_members = COCREATION_BOL_Service::getInstance()->getRoomMembers($params['roomId']);
            $members = array();
            foreach($room_members as $member) {
                $user   = BOL_UserService::getInstance()->findByEmail($member->email);
                $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user->id))[$user->id];
                $avatar['isJoined'] = $member->isJoined;
                array_push($members, $avatar);
            }
            $this->assign('members', $members);
            $this->assign('currentUser' , BOL_AvatarService::getInstance()->getDataForUserAvatars(array(OW::getUser()->getId()))[OW::getUser()->getId()]);

            //Set room shared documents
            $documents = COCREATION_BOL_Service::getInstance()->getDocumentsByRoomId($params['roomId']);
            $this->assign('documents', array($documents[0]->url, $documents[1]->url, $documents[2]->url));
            $this->assign('outcome_ro_url', $this->getOutcomeReadonlyPadID($documents[2]->url));

            //get all dataset for current room
            $this->addComponent('datasets_library', new COCREATION_CMP_DatasetsLibrary($params['roomId']));
            if(strpos($_SERVER['HTTP_USER_AGENT'],'Firefox'))
            {
                //get all datalets for current room
                $this->addComponent('datalets_slider', new COCREATION_CMP_DataletsSlider($params['roomId']));
            }

            $datasets = COCREATION_BOL_Service::getInstance()->getDatasetsByRoomId($params['roomId']);
            $suggested_datasets_string = '[';
            foreach($datasets as $dataset) $suggested_datasets_string .= '{"resource_name":"' . $dataset->name .'","url": "' . $dataset->url .'","metas" : { "description" : "' . $dataset->name .'"}},';
            $suggested_datasets_string = rtrim($suggested_datasets_string, ",") . ']';

            $this->assign('components_url', SPODPR_COMPONENTS_URL);
            $this->assign('datasets_list', ODE_DATASET_LIST);

            $js = UTIL_JsGenerator::composeJsString('
                ODE.current_room_url                    = {$current_room_url}
                ODE.ajax_coocreation_room_add_dataset   = {$ajax_coocreation_room_add_dataset}
                ODE.ajax_coocreation_room_get_datasets  = {$ajax_coocreation_room_get_datasets}
                ODE.ajax_coocreation_room_add_datalet   = {$ajax_coocreation_room_add_datalet}
                ODE.ajax_coocreation_room_get_datalets  = {$ajax_coocreation_room_get_datalets}
                ODE.ajax_coocreation_room_add_postit    = {$ajax_coocreation_room_add_postit}
                ODE.numDataletsInCocreationRooom        = {$numDataletsInRoom}
                ODE.pluginPreview                       = "cocreation"
                SPODPUBLICROOM = {}
                SPODPUBLICROOM.suggested_datasets       = {$coocreation_room_suggested_datasets}
                /*COCREATION  = {}*/
                COCREATION.roomId                       = {$roomId}
                COCREATION.entity_type                  = {$entity_type}
            ', array(
                'current_room_url'                    => str_replace("/index", "", OW::getRouter()->urlFor('COCREATION_CTRL_KnowledgeRoom', 'index')) . $params['roomId'],
                'ajax_coocreation_room_add_dataset'   => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'addDatasetToRoom')   . "?roomId="  . $params['roomId'],
                'ajax_coocreation_room_get_datasets'  => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getDatasetsForRoom') . "?roomId="  . $params['roomId'],
                'ajax_coocreation_room_add_datalet'   => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'addDataletToRoom')   . "?roomId="  . $params['roomId'],
                'ajax_coocreation_room_get_datalets'  => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getRoomDatalets')    . "?roomId="  . $params['roomId'],
                'ajax_coocreation_room_add_postit'    => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'addPostitToDatalet') . "?roomId="  . $params['roomId'],
                'numDataletsInRoom'                   => count(COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($params['roomId'])),
                'coocreation_room_suggested_datasets' => $suggested_datasets_string,
                'roomId'                              => $params['roomId'],
                'entity_type'                         => COCREATION_BOL_Service::ENTITY_TYPE
            ));

            OW::getDocument()->addOnloadScript($js);
            OW::getDocument()->addOnloadScript("room.init()");
            OW::getDocument()->addOnloadScript("room.initSlider()");

            OW::getLanguage()->addKeyForJs('cocreation', 'room_menu_cocreation');
            OW::getLanguage()->addKeyForJs('cocreation', 'room_menu_data');
            OW::getLanguage()->addKeyForJs('cocreation', 'room_menu_tools');
        }
    }
}
