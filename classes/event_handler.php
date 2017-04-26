<?php

class COCREATION_CLASS_EventHandler
{
    private static $FIBONACCI_FIRST_20_NUMBERS = array(/*0,1,1,2,3,5,8,*/13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765);
    private static $classInstance;

    public static function getInstance()
    {
        if (self::$classInstance === null) {
            self::$classInstance = new self();
        }

        return self::$classInstance;
    }

    public function init()
    {

        //OW::getEventManager()->bind('notifications.collect_actions', array($this, 'onCollectNotificationActions'));
        OW::getEventManager()->bind('spodnotification.collect_actions', array($this, 'onCollectNotificationActions'));
        //OW::getEventManager()->bind('notifications.send_list',       array($this, 'onCollectNotificationSendList'));
        OW::getEventManager()->bind('spodtchat.add_comment',         array($this, 'sendNotificationOnCollectComment'));
    }

    public function onCollectNotificationActions( BASE_CLASS_EventCollector $e )
    {
        $sectionLabel = OW::getLanguage()->text('cocreation', 'main_menu_item');
        //Only for moderator and admin
        if(BOL_AuthorizationService::getInstance()->isModerator() || OW::getUser()->isAdmin()) {

            $e->add(array(
                'section' => 'cocreation',
                'action' => 'room-created',
                'description' => OW::getLanguage()->text('cocreation', 'email_notifications_setting_room_created'),
                'selected' => false,
                'sectionLabel' => $sectionLabel,
                'sectionIcon' => 'ow_ic_write'
            ));
        }
        //For all users
        $e->add(array(
            'section' => 'cocreation',
            'action'  => 'add-comment',
            'description' => OW::getLanguage()->text('cocreation', 'email_notifications_setting_room_comment'),
            'selected' => false,
            'sectionLabel' => $sectionLabel,
            'sectionIcon' => 'ow_ic_write'
        ));
    }
    //Batch notification
    public function onCollectNotificationSendList( BASE_CLASS_EventCollector $event )
    {
        /*Send notificatio using fibonacci numbers*/
        /*$rooms = COCREATION_BOL_Service::getInstance()->getAllRooms();
        foreach($rooms as $room){
            //$count =  BOL_CommentService::getInstance()->findCommentCount(COCREATION_BOL_Service::ROOM_ENTITY_TYPE, $room->id);

            //if(in_array($count, COCREATION_CLASS_EventHandler::$FIBONACCI_FIRST_20_NUMBERS)) {
                $members = COCREATION_BOL_Service::getInstance()->getRoomMembers($room->id);
                foreach ($members as $member) {
                    //send notification
                    $event->add(array(
                        'pluginKey' => 'cocreation',
                        'action' => 'room-comments-collect',
                        'entityType' => 'room_comments_collect',
                        'entityId' => $room->id,
                        'userId' => $member->userId,
                        'data' => array(
                            'format' => "text",
                            'string' => array(
                                'key' => 'cocreation+notification_room_comments_collect',
                                'vars' => array(
                                    'roomname' => $room->name
                                )
                            ),
                            //'url' => str_replace("index/", $room->id, $room->type == "knowledge" ? OW::getRouter()->urlFor( 'COCREATION_CTRL_KnowledgeRoom' , 'index') :  OW::getRouter()->urlFor( 'COCREATION_CTRL_DataRoom' , 'index')),
                            "contentImage" => ''
                        )));
                }
            //}
        }*/
    }
    //Custom on event notification
    public function sendNotificationRoomCreated($room)
    {
        $message = OW::getLanguage()->text('cocreation','notification_room_created', ['ownername' => BOL_UserService::getInstance()->getDisplayName($room->ownerId)]) .
            " <b><a href=\"" . str_replace("index/", $room->id, OW::getRouter()->urlFor( 'COCREATION_CTRL_DataRoom' , 'index')) . "\">". $room->name ."</a></b>";
        $data = array('message' => $message,
            'subject' => OW::getLanguage()->text('cocreation','email_notifications_setting_room_created'));

        $event = new OW_Event('notification_system.add_notification', array(
            'type'      => "mail",
            'plugin'    => "cocreation",
            "action"    => "room-created",
            'data' => json_encode($data)
        ));
        OW::getEventManager()->trigger($event);

    }

    private function getCocreationRoomId($commentEntityId){
        $entity = BOL_CommentService::getInstance()->findCommentEntityById($commentEntityId);
        while($entity->entityType != COCREATION_BOL_Service::ROOM_ENTITY_TYPE && $entity != null){
            $comment = BOL_CommentService::getInstance()->findComment($entity->entityId);
            $entity = BOL_CommentService::getInstance()->findCommentEntityById($comment->commentEntityId);
        }
        return $entity->entityId;
    }

    public function sendNotificationOnCollectComment(OW_Event $event)
    {
        $params = $event->getParams();
        $room = COCREATION_BOL_Service::getInstance()->getRoomById($this->getCocreationRoomId($params['comment']->getCommentEntityId()));

        $message = OW::getLanguage()->text('cocreation','notification_room_comments_collect', ['roomname' => $room->name]) .
                   " <b><a href=\"" . str_replace("index/", $room->id, OW::getRouter()->urlFor( 'COCREATION_CTRL_DataRoom' , 'index')) . "\">" . $room->name . "</a></b>";
        $data = array('message' => $message,
                      'subject' => OW::getLanguage()->text('cocreation','email_notifications_setting_room_comment'));

        $event = new OW_Event('notification_system.add_notification', array(
            'type'      => "mail",
            'plugin'    => "cocreation",
            "action"    => "add-comment",
            'data' => json_encode($data)
        ));
        OW::getEventManager()->trigger($event);
    }
}