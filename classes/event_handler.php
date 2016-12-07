<?php

class COCREATION_CLASS_EventHandler
{
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

        OW::getEventManager()->bind('notifications.collect_actions', array($this, 'onCollectNotificationActions'));
        OW::getEventManager()->bind('notifications.send_list',       array($this,'onCollectNotificationSendList'));
    }

    public function onCollectNotificationActions( BASE_CLASS_EventCollector $e )
    {
        $sectionLabel = OW::getLanguage()->text('cocreation', 'main_menu_item');

        $e->add(array(
            'section'      => 'cocreation',
            'action'       => 'room-created',
            'description'  => OW::getLanguage()->text('cocreation', 'email_notifications_setting_room_created'),
            'selected'     => false,
            'sectionLabel' => $sectionLabel,
            'sectionIcon'  => 'ow_ic_write'
        ));

        $e->add(array(
            'section'      => 'cocreation',
            'action'       => 'room-comment',
            'description'  => OW::getLanguage()->text('cocreation', 'email_notifications_setting_room_comment'),
            'selected'     => false,
            'sectionLabel' => $sectionLabel,
            'sectionIcon'  => 'ow_ic_write'
        ));
    }

    //Batch notification
    public function onCollectNotificationSendList( BASE_CLASS_EventCollector $event )
    {
        /*$params = $event->getParams();
        $userIdList = $params['userIdList'];

        $unreadFriendRequests = FRIENDS_BOL_Service::getInstance()->getUnreadFriendRequestsForUserIdList($userIdList);

        foreach ( $unreadFriendRequests as $id => $friendship )
        {
            $avatars = BOL_AvatarService::getInstance()->getDataForUserAvatars(array( $friendship->userId ) );
            $avatar = $avatars[$friendship->userId];

            $event->add(array(
                'pluginKey' => 'friends',
                'entityType' => 'friends-request',
                'entityId' => $friendship->id,
                'userId' => $friendship->friendId,
                'action' => 'friends-request',
                'time' => $friendship->timeStamp,

                'data' => array(
                    'avatar' => $avatar,
                    'string' => OW::getLanguage()->text('friends', 'notify_request_string', array(
                        'displayName' => BOL_UserService::getInstance()->getDisplayName($friendship->userId),
                        'userUrl' => BOL_UserService::getInstance()->getUserUrl($friendship->userId),
                        'url' => OW::getRouter()->urlForRoute('friends_lists', array('list'=>'got-requests'))
                    )))
            ));

            $unreadFriendRequests[$id]->notificationSent = 1;
            FRIENDS_BOL_Service::getInstance()->saveFriendship($unreadFriendRequests[$id]);
        }*/
    }

    //Custom on event notification
    public function sendNotificationRoomCreated($room)
    {
        $users = BOL_UserService::getInstance()->findList(0,10000);

        //$message = 'L\'utente '. BOL_UserService::getInstance()->getDisplayName($room->ownerId) . ' ha creato la stanza  <b><i>'. $room->name . '</i></b>';

        foreach($users as $user) {

            $avatars = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($room->ownerId));
            $avatar = $avatars[$room->ownerId];

            $event = new OW_Event('notifications.add', array(
                'pluginKey' => 'cocreation',
                'action' => 'room-created',
                'entityType' => 'new_room_created',
                'entityId' => $room->id,
                'userId' => $user->id,
            ), array(
                'format' => "text",
                'avatar' => $avatar,
                'string' => array(
                    'key' => 'cocreation+notification_room_created',
                    'vars' => array(
                        'ownername' => BOL_UserService::getInstance()->getDisplayName($room->ownerId),
                        'roomname'  => $room->name
                    )
                ),
                'url' => 'http://192.168.164.128',//room_url
                "contentImage" => 'http://192.168.164.128'//new_room_url_image
            ));

            OW::getEventManager()->trigger($event);
        }
    }
}