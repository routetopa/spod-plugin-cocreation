<?php

class COCREATION_CTRL_DataRoom extends OW_ActionController
{

    public function index(array $params)
    {
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
        $members = array();
        foreach($room_members as $member) {
            $user   = BOL_UserService::getInstance()->findByEmail($member->email);
            $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user->id))[$user->id];
            $avatar['isJoined'] = $member->isJoined;
            array_push($members, $avatar);
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
        $this->assign('spreadsheet', $sheetUrl);
        $this->assign('notes',       COCREATION_BOL_Service::getInstance()->getDocumentsByRoomId($params['roomId'])[0]->url);

        $data = COCREATION_BOL_Service::getInstance()->getSheetData($sheetName);
        $headers = array();
        foreach($data as $serie) array_push($headers, $serie->name);
        $this->assign('headers', $headers);
        $this->assign('data', json_encode($data));

        //$this->assign('metadatas', COCREATION_BOL_Service::getInstance()->getMatadatasByRoomId($params['roomId']));

        $js = UTIL_JsGenerator::composeJsString('
                ODE.ajax_coocreation_room_get_sheetdata   = {$ajax_coocreation_room_get_sheetdata}
                COCREATION = {};
                COCREATION.sheetName                      = {$sheetName}
            ', array(
               'ajax_coocreation_room_get_sheetdata'   => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getSheetData')   . "?sheetName="  . 'testz',
               'sheetName'                             => $sheetName
        ));
        OW::getDocument()->addOnloadScript($js);
        OW::getDocument()->addOnloadScript("data_room.init()");
    }

}