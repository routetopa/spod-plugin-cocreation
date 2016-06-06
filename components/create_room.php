<?php


class COCREATION_CMP_CreateRoom extends OW_Component
{
    public function __construct()
    {
        $friendsInfo = [];
        $users = BOL_UserService::getInstance()->findList(0,10000);

        foreach($users as $user)
        {
            $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user->id));
            $user = BOL_UserService::getInstance()->findUserById($user->id);

            $friendsInfo[] = array(
                              "id" => $user->id,
                              "name" => BOL_UserService::getInstance()->getDisplayName($user->id),
                              "username" => $user->username,
                              "email" => $user->email,
                              "avatar" => $avatar[$user->id]["src"],
                              "url" => $avatar[$user->id]["url"]
                            );
        }

        $this->assign('friends_info', json_encode($friendsInfo));
        $this->assign('components_url', SPODPR_COMPONENTS_URL);

        $form = new Form('CoCreationEpAddRoomForm');

        $name = new TextField('name');
        $name->setRequired(true);

        $subject  = new TextField('subject');
        $subject->setRequired(true);

        $description  = new TextField('description');
        $description->setRequired(true);

        $goal  = new TextField('goal');
        $goal->setRequired(true);

        $template  = new Selectbox('template');

        /*$availableTemplate = COCREATIONEP_BOL_Service::getInstance()->getAllTemplates();
        $template->setRequired(false);

        foreach($availableTemplate as $tmp)
            $template->addOption($tmp->id, $tmp->name);*/

        $invitationText  = new TextField('invitation_text');
        $invitationText->setRequired(true);

        $usersValue  = new HiddenField('users_value');
        $usersValue->setValue("");
        $usersValue->setId('users_value');
        $usersValue->setRequired(false);

        $isOpen = new CheckboxField('is_open');
        $isOpen->setRequired(false);

        $managerOp  = new HiddenField('manager_op');
        $managerOp->setValue("requestToAddRoom");
        $managerOp->setId('manager_op');

        $submit = new Submit('submit');
        $submit->setId('submit_new_room');
        $submit->setValue(OW::getLanguage()->text('cocreation', 'create_room_button_label'));

        $form->addElement($name);
        $form->addElement($subject);
        $form->addElement($description);
        $form->addElement($goal);
        $form->addElement($template);
        $form->addElement($invitationText);
        $form->addElement($usersValue);
        $form->addElement($managerOp);
        $form->addElement($isOpen);
        $form->addElement($submit);

        $form->setAction(OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'createRoom'));
        $this->addForm($form);

        OW::getDocument()->addOnloadScript("
           COCREATION.init();
           $('#submit_new_room').click(function(){
              $('#submit_overlay').css('display','block')
           });
        ");

    }
}