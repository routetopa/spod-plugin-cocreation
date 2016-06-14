<?php

class COCREATION_CTRL_DataRoom extends OW_ActionController
{
    public function index(array $params)
    {
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl() . 'cocreation.js');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl() . 'cocreation-room.js');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl() . 'cocreation-data.js');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('spodpublic')->getStaticJsUrl() . 'perfect-scrollbar.jquery.js');
        OW::getDocument()->getMasterPage()->setTemplate(OW::getPluginManager()->getPlugin('cocreation')->getRootDir() . 'master_pages/general.html');
        $this->assign('components_url', SPODPR_COMPONENTS_URL);

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
        $members    = array();
        $membersIds = array($room->ownerId);

        foreach($room_members as $member) {
            $user   = BOL_UserService::getInstance()->findByEmail($member->email);
            $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user->id))[$user->id];
            $avatar['isJoined'] = $member->isJoined;
            array_push($members, $avatar);
            array_push($membersIds, $user->id);
        }
        $this->assign('members', $members);
        $this->assign('currentUser' , BOL_AvatarService::getInstance()->getDataForUserAvatars(array(OW::getUser()->getId()))[OW::getUser()->getId()]);

        //comment and rate
        $commentsParams = new BASE_CommentsParams('cocreation', COCREATION_BOL_Service::ROOM_ENTITY_TYPE);
        $commentsParams->setEntityId($params['roomId']);//1001 to test
        $commentsParams->setDisplayType(BASE_CommentsParams::DISPLAY_TYPE_WITH_LOAD_LIST);
        $commentsParams->setCommentCountOnPage(5);
        $commentsParams->setOwnerId((OW::getUser()->getId()));
        $commentsParams->setAddComment(TRUE);
        $commentsParams->setWrapInBox(false);
        $commentsParams->setShowEmptyList(false);
        $commentsParams->setCommentPreviewMaxCharCount(5000);

        /*if(isset($_REQUEST["comments_pagination"]) && $_REQUEST["comments_pagination"] == "false")
            $commentsParams->setInitialCommentsCount(100000000);*/
        $commentsParams->level = 1;
        $commentsParams->nodeId = 0;

        /* ODE */
        if (OW::getPluginManager()->isPluginActive('spodpr'))
            $this->addComponent('private_room', new SPODPR_CMP_PrivateRoomCard('ow_attachment_btn', array('datalet', 'link'), "public-room"));
        /* ODE */

        SPODTCHAT_CMP_Comments::$numberOfNestedLevels = 2;
        SPODTCHAT_CMP_Comments::$COMMENT_ENTITY_TYPE  = COCREATION_BOL_Service::COMMENT_ENTITY_TYPE;
        $commentCmp = new SPODTCHAT_CMP_Comments($commentsParams);
        $this->addComponent('comments', $commentCmp);

        $sheetUrl = COCREATION_BOL_Service::getInstance()->getSheetByRoomId($params['roomId'])[0]->url;
        $sheetName = explode('/', $sheetUrl)[4];
        $noteUrl = COCREATION_BOL_Service::getInstance()->getDocumentsByRoomId($params['roomId'])[0]->url;
        $this->assign('spreadsheet', $sheetUrl);
        $this->assign('notes', $noteUrl);

        $data = COCREATION_BOL_Service::getInstance()->getSheetData($sheetName);
        $headers = array();
        foreach($data as $serie) array_push($headers, $serie->name);
        $this->assign('headers', $headers);
        $this->assign('data', json_encode($data));

        $metadata = COCREATION_BOL_Service::getInstance()->getMatadatasByRoomId($params['roomId']);

        $this->assign('core_common_required_metadatas', json_decode($metadata[0]->common_core_required));
        $this->assign('common_core_if_applicable_metadatas', json_decode($metadata[0]->common_core_if_applicable));
        $this->assign('expanded_metadatas', json_decode($metadata[0]->expanded));
        $this->addComponent('datalets_slider', new COCREATION_CMP_DataletsSlider($params['roomId']));

        $js = UTIL_JsGenerator::composeJsString('
                ODE.ajax_coocreation_room_get_sheetdata       = {$ajax_coocreation_room_get_sheetdata}
                ODE.ajax_coocreation_room_get_array_sheetdata = {$ajax_coocreation_room_get_array_sheetdata}
                ODE.ajax_coocreation_room_update_metadatas    = {$ajax_coocreation_room_update_metadatas}
                ODE.ajax_coocreation_room_add_datalet         = {$ajax_coocreation_room_add_datalet}
                ODE.ajax_coocreation_room_publish_dataset     = {$ajax_coocreation_room_publish_dataset}
                ODE.ajax_coocreation_room_get_html_note       = {$ajax_coocreation_room_get_html_note}
                COCREATION.sheetName                          = {$sheetName}
                COCREATION.roomId                             = {$roomId}
                COCREATION.room_type                          = "data"
                COCREATION.entity_type                        = {$entity_type}
                COCREATION.room_members                       = {$room_members}
            ', array(
               'ajax_coocreation_room_get_sheetdata'       => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getSheetData')              . "?sheetName=" . $sheetName,
               'ajax_coocreation_room_get_array_sheetdata' => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getArrayOfObjectSheetData') . "?sheetName=" . $sheetName,
               'ajax_coocreation_room_update_metadatas'    => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'updateMetadatas'),
               'ajax_coocreation_room_add_datalet'         => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'addDataletToRoom')          . "?roomId="  . $params['roomId'],
               'ajax_coocreation_room_publish_dataset'     => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'publishDataset'),
               'ajax_coocreation_room_get_html_note'       => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getNoteHTMLByPadIDApiUrl')  . "?noteUrl="  . $noteUrl,
               'sheetName'                                 => $sheetName,
               'roomId'                                    => $params['roomId'],
               'entity_type'                               => COCREATION_BOL_Service::ROOM_ENTITY_TYPE,
               'room_members'                              => json_encode($membersIds)
        ));
        OW::getDocument()->addOnloadScript($js);
        OW::getDocument()->addOnloadScript("data_room.init()");
    }

}