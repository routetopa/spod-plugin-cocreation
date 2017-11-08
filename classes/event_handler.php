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
        OW::getEventManager()->bind('spodnotification.collect_actions', array($this, 'onCollectNotificationActions'));
        OW::getEventManager()->bind('spod_discussion.add_comment',      array($this, 'sendNotificationOnCollectComment'));
    }

    public function onCollectNotificationActions( BASE_CLASS_EventCollector $e )
    {
        //Only for moderator and admin
        /*if(BOL_AuthorizationService::getInstance()->isModerator() || OW::getUser()->isAdmin()) {

            $e->add(array(
                'section' => COCREATION_CLASS_Consts::PLUGIN_NAME,
                'action' => COCREATION_CLASS_Consts::PLUGIN_ACTION_NEW_ROOM,
                'description' => OW::getLanguage()->text('cocreation', 'email_notifications_setting_room_created'),
                'selected' => false,
                'sectionLabel' => OW::getLanguage()->text('cocreation', 'main_menu_item'),
                'sectionIcon' => 'ow_ic_write',
                'sectionClass' => 'action'
            ));
        }
        //For all users
       $e->add(array(
            'section' => 'cocreation',
            'action'  => 'cocreation_add_comment',
            'description' => OW::getLanguage()->text('cocreation', 'email_notifications_setting_room_comment'),
            'selected' => false,
            'sectionLabel' => $sectionLabel,
            'sectionIcon' => 'ow_ic_write'
        ));*/

        $e->add(array(
            'section' => COCREATION_CLASS_Consts::PLUGIN_NAME,
            'action' => COCREATION_CLASS_Consts::PLUGIN_ACTION_NEW_ROOM,
            'description' => OW::getLanguage()->text('cocreation', 'email_notifications_setting_room_created'),
            'selected' => false,
            'sectionLabel' => OW::getLanguage()->text('cocreation', 'main_menu_item'),
            'sectionIcon' => 'ow_ic_write',
            'sectionClass' => 'action'
        ));

        $e->add(array(
            'section' => COCREATION_CLASS_Consts::PLUGIN_NAME,
            'action'  => COCREATION_CLASS_Consts::PLUGIN_ACTION_ROOM_INVITATION,
            'description' => OW::getLanguage()->text('cocreation', 'notification_room_invitation_label'),
            'selected' => false,
            'sectionLabel' => OW::getLanguage()->text('cocreation', 'main_menu_item'),
            'sectionIcon' => 'ow_ic_write',
            'sectionClass' => 'action'
        ));

        $e->add(array(
            'section' => COCREATION_CLASS_Consts::PLUGIN_NAME,
            'action'  => COCREATION_CLASS_Consts::PLUGIN_ACTION_DATASET_PUBLISHED,
            'description' => OW::getLanguage()->text('cocreation', 'notification_dataset_published_label'),
            'selected' => false,
            'sectionLabel' => OW::getLanguage()->text('cocreation', 'main_menu_item'),
            'sectionIcon' => 'ow_ic_write',
            'sectionClass' => 'action'
        ));


    }

    //Custom on event notification
    public function sendNotificationRoomCreated($room)
    {
        //EMAIL
        $message = OW::getLanguage()->text('cocreation','notification_room_created', ['ownername' => "<b><a>" . BOL_UserService::getInstance()->getDisplayName($room->ownerId) . "</a></b>"]) .
            " <b><a href=\"" . str_replace("index/", $room->id, OW::getRouter()->urlFor( 'COCREATION_CTRL_DataRoom' , 'index')) . "\">". $room->name ."</a></b>";

        $event = new OW_Event('notification_system.add_notification', array(
            'notifications' => [
                new SPODNOTIFICATION_CLASS_MailEventNotification(
                    COCREATION_CLASS_Consts::PLUGIN_NAME,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_NEW_ROOM,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_NEW_ROOM,
                    null,
                    OW::getLanguage()->text('cocreation','email_notifications_setting_room_created'),
                    $message,
                    $message
                ),
                new SPODNOTIFICATION_CLASS_MobileEventNotification(
                    COCREATION_CLASS_Consts::PLUGIN_NAME,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_NEW_ROOM,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_NEW_ROOM,
                    null,
                    'CoCreation',
                    $message,
                    ['roomId' => $room->id]
                )
            ]
        ));

        OW::getEventManager()->trigger($event);

    }

    public function sendNotificationRoomInvitation($room, $newMemberId){

        $message =
            OW::getLanguage()->text('cocreation','notification_room_invitation',
                ['ownername' => "<b><a>" . BOL_UserService::getInstance()->getDisplayName($room->ownerId) . "</a></b>",
                 'roomname' => "<b>" . $room->name . "</b>"  ]
            );

        $event = new OW_Event('notification_system.add_notification', array(
            'notifications' => [
                new SPODNOTIFICATION_CLASS_MailEventNotification(
                    COCREATION_CLASS_Consts::PLUGIN_NAME,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_ROOM_INVITATION,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_ROOM_INVITATION,
                    $newMemberId,
                    OW::getLanguage()->text('spodnotification','email_notifications_subject_delayed'),
                    $message,
                    $message
                ),
                new SPODNOTIFICATION_CLASS_MobileEventNotification(
                    COCREATION_CLASS_Consts::PLUGIN_NAME,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_ROOM_INVITATION,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_ROOM_INVITATION,
                    $newMemberId,
                    'CoCreation',
                    $message,
                    ['roomId' => $room->id]
                )
            ]
        ));

        OW::getEventManager()->trigger($event);
    }

    public function sendNotificationDatasetPublished($title)
    {
        $message =
            OW::getLanguage()->text('cocreation','notification_dataset_published',
                ['datasetname' => "<b><a>" . $this . "</a></b>"  ]
            );

        $event = new OW_Event('notification_system.add_notification', array(
            'notifications' => [
                new SPODNOTIFICATION_CLASS_MailEventNotification(
                    COCREATION_CLASS_Consts::PLUGIN_NAME,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_DATASET_PUBLISHED,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_DATASET_PUBLISHED,
                    null,
                    OW::getLanguage()->text('spodnotification','email_notifications_subject_delayed'),
                    $message,
                    $message
                ),
                new SPODNOTIFICATION_CLASS_MobileEventNotification(
                    COCREATION_CLASS_Consts::PLUGIN_NAME,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_DATASET_PUBLISHED,
                    COCREATION_CLASS_Consts::PLUGIN_ACTION_DATASET_PUBLISHED,
                    null,
                    'CoCreation',
                    $message,
                    []
                )
            ]
        ));
    }

    /*private function getCocreationRoomId($commentEntityId){
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
        $room = COCREATION_BOL_Service::getInstance()->getRoomById($this->getCocreationRoomId($params['comment']->entityId));
        $user = $user = BOL_UserService::getInstance()->findUserById($params['comment']->ownerId);

        $message = OW::getLanguage()->text('cocreation','notification_room_comments_collect', ['roomname' => $room->name]) .
                   " <b><a href=\"" . str_replace("index/", $room->id, OW::getRouter()->urlFor( 'COCREATION_CTRL_DataRoom' , 'index')) . "\">" . $room->name . "</a></b><br><br>".
                   "   <b><i>" . $user->username . "</i></b><br>\"<i>" . $params['comment']->comment ."\"</i>"  ;
        $data = array('message' => $message,
                      'subject' => OW::getLanguage()->text('cocreation','email_notifications_setting_room_comment'));

        $event = new OW_Event('notification_system.add_notification', array(
            'type'      => SPODNOTIFICATION_CLASS_Consts::TYPE_MAIL,
            'plugin'    => "cocreation",
            "action"    => "add_comment",
            'data' => json_encode($data)
        ));
        OW::getEventManager()->trigger($event);
    }*/
}