<?php

class COCREATION_CTRL_Main extends OW_ActionController
{

    public function index()
    {
        OW::getDocument()->getMasterPage()->setTemplate(OW::getPluginManager()->getPlugin('cocreation')->getRootDir() . 'master_pages/general.html');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticJsUrl() . 'cocreation.js', 'text/javascript');

        $this->assign('components_url', SPODPR_COMPONENTS_URL);

        $invitations      = array();
        $visible_rooms    = array();

        $rooms = COCREATION_BOL_Service::getInstance()->getAllRooms();
        foreach ($rooms as $room) {
            if (COCREATION_BOL_Service::getInstance()->isMemberJoinedToRoom(OW::getUser()->getId(), $room->id) ||
                OW::getUser()->getId() == intval($room->ownerId)
            ) {
                $owner = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($room->ownerId));
                $room->owner = $owner[$room->ownerId]['title'];
                array_push($visible_rooms, $room);
            } else {
                $members = COCREATION_BOL_Service::getInstance()->getRoomMembers($room->id);
                $isInvited = false;
                foreach($members as $member){
                    if(intval($member->userId) == OW::getUser()->getId()){
                        $isInvited = true;
                        break;
                    }
                }
                if($isInvited){
                    $u = BOL_UserService::getInstance()->findUserById(intval($room->ownerId));
                    $js = "$.post('" .
                        OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'confirmToJoinToRoom') . "?roomId=" . $room->id . "&memberId=" . OW::getUser()->getId() . "',
                    {}, function (data, status) {
                       window.location ='" .
                        str_replace("index/", $room->id, OW::getRouter()->urlFor(($room->type == "data") ? 'COCREATION_CTRL_DataRoom'
                                                                                                         : 'COCREATION_CTRL_KnowledgeRoom', 'index')) . "';});";

                    array_push($invitations, "<b>" . $u->username . "</b> " . OW::getLanguage()->text('cocreation', 'room_invitation_text_toast') . "<b> " . $room->name .
                        "</b>     <input class=\"confirm_button\" type=\"button\" value=\"" . OW::getLanguage()->text('cocreation', 'room_confirm_to_join') .
                        "\" onclick=\"" . $js . "\">");
                }
            }
        }

        $this->assign('invitations', $invitations);
        $this->assign('cocreation_rooms', $visible_rooms);
       /*$this->assign('partialRoomUrl', str_replace("index/", "", OW::getRouter()->urlFor(($room->type == "data") ? 'COCREATION_CTRL_DataRoom'
                                                                                                                  : 'COCREATION_CTRL_KnowledgeRoom', 'index')));*/
        $this->assign('partialRoomUrl',OW_URL_HOME.'/cocreation/');
        $this->assign('isActive', true);
    }
}