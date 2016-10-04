<?php

class COCREATION_CTRL_Admin extends ADMIN_CTRL_Abstract
{
    public function settings($params)
    {
        $this->assign('components_url', SPODPR_COMPONENTS_URL);

        $this->setPageTitle(OW::getLanguage()->text('cocreation', 'admin_title'));
        $this->setPageHeading(OW::getLanguage()->text('cocreation', 'admin_heading'));

        $form = new Form('settings');
        $this->addForm($form);

        $submit = new Submit('add');

        $document_server_field    = new HiddenField('document_server_status');
        $document_server_field->setId("document_server_status");
        $spreadsheet_server_field = new HiddenField('spreadsheet_server_status');
        $spreadsheet_server_field->setId("spreadsheet_server_status");
        $document_room_field      = new HiddenField('knowledge_room_status');
        $document_room_field->setId("knowledge_room_status");
        $spreadsheet_room_field   = new HiddenField('dataset_room_status');
        $spreadsheet_room_field->setId("dataset_room_status");

        $form->addElement($document_server_field);
        $form->addElement($spreadsheet_server_field);
        $form->addElement($document_room_field);
        $form->addElement($spreadsheet_room_field);

        $doc_connection    = @fsockopen('localhost', '9001');
        $spread_connection = @fsockopen('localhost', '8001');

        //Set document and spreasheet server toggle button status
        if (is_resource($doc_connection))
        {
            $this->assign('document_server_status', true);
            $document_server_field->setValue("true");
        }
        else
        {
            $this->assign('document_server_status', false);
            $document_server_field->setValue("false");
        }

        if (is_resource($spread_connection))
        {
            $this->assign('spreadsheet_server_status', true);
            $spreadsheet_server_field->setValue("true");
        }
        else
        {
            $this->assign('spreadsheet_server_status', false);
            $spreadsheet_server_field->setValue("false");
        }

        //Set knowledge and dataset room toggle button status based on saved preferences
        $knowledge_room_status_preference = BOL_PreferenceService::getInstance()->findPreference('knowledge_room_status_preference');
        if(empty($knowledge_room_status_preference) || $knowledge_room_status_preference->defaultValue == "false") {
            $this->assign('knowledge_room_status', false);
            $document_room_field->setValue("false");
        }else{
            $this->assign('knowledge_room_status', true);
            $document_room_field->setValue($knowledge_room_status_preference->defaultValue);
        }

        $dataset_room_status_preference = BOL_PreferenceService::getInstance()->findPreference('dataset_room_status_preference');
        if(empty($dataset_room_status_preference) || $dataset_room_status_preference->defaultValue == "false") {
            $this->assign('dataset_room_status', false);
            $spreadsheet_room_field->setValue("false");
        }else{
            $this->assign('dataset_room_status', true);
            $spreadsheet_room_field->setValue($dataset_room_status_preference->defaultValue);
        }

        $submit->setValue('SAVE');
        $form->addElement($submit);

        if ( OW::getRequest()->isPost() && $form->isValid($_POST) )
        {
            $data = $form->getValues();

            //DOCUMENT SERVER
            $document_server_status_preference = BOL_PreferenceService::getInstance()->findPreference('document_server_status_preference');
            if(empty($document_server_status_preference)) {
                $document_server_status_preference = new BOL_Preference();
            }

            $document_server_status_preference->key = 'document_server_status_preference';
            $document_server_status_preference->sortOrder = 1;
            $document_server_status_preference->sectionName = 'general';

            $this->assign('document_server_status', $data['document_server_status'] == "true" ? true : false);
            if($data['document_server_status'] == "false")
            {
                //is running
                shell_exec("/usr/bin/sudo /usr/bin/service etherpad-lite stop");
                $document_server_status_preference->defaultValue = "false";
                $document_server_field->setValue("false");
            }
            else
            {
                //is not running
                shell_exec("/usr/bin/sudo /usr/bin/service etherpad-lite start");
                $document_server_status_preference->defaultValue = "true";
                $document_server_field->setValue("true");
            }

            BOL_PreferenceService::getInstance()->savePreference($document_server_status_preference);

            //SPEADSHEET SERVER
            $spreadsheet_server_status_preference = BOL_PreferenceService::getInstance()->findPreference('spreadsheet_server_status_preference');
            if(empty($spreadsheet_server_status_preference)) {
                $spreadsheet_server_status_preference = new BOL_Preference();
            }

            $spreadsheet_server_status_preference->key = 'spreadsheet_server_status_preference';
            $spreadsheet_server_status_preference->sortOrder = 2;
            $spreadsheet_server_status_preference->sectionName = 'general';

            $this->assign('spreadsheet_server_status', $data['spreadsheet_server_status'] == "true" ? true : false);
            if($data['spreadsheet_server_status'] == "false")
            {
                //is running
                shell_exec("/usr/bin/sudo /usr/bin/service ethersheet stop");
                $spreadsheet_server_status_preference->defaultValue = "false";
                $spreadsheet_server_field->setValue("false");
            }
            else
            {
                //is not running
                shell_exec("/usr/bin/sudo /usr/bin/service ethersheet start");
                $spreadsheet_server_status_preference->defaultValue = "true";
                $this->assign('spreadsheet_server_status', true);
                $spreadsheet_server_field->setValue("true");
            }

            BOL_PreferenceService::getInstance()->savePreference($spreadsheet_server_status_preference);

            //KNOWLEDGE ROOM PREFERENCES
            $knowledge_room_status_preference = BOL_PreferenceService::getInstance()->findPreference('knowledge_room_status_preference');
            if(empty($knowledge_room_status_preference)) {
                $knowledge_room_status_preference = new BOL_Preference();
            }

            $knowledge_room_status_preference->key = 'knowledge_room_status_preference';
            $knowledge_room_status_preference->sortOrder = 3;
            $knowledge_room_status_preference->sectionName = 'general';

            $this->assign('knowledge_room_status', $data['knowledge_room_status'] == "true" ? true : false);
            $document_room_field->setValue($data['knowledge_room_status']);
            $knowledge_room_status_preference->defaultValue = $data['knowledge_room_status'];

            BOL_PreferenceService::getInstance()->savePreference($knowledge_room_status_preference);

            //DATASET ROOM PREFERENCES
            $dataset_room_status_preference = BOL_PreferenceService::getInstance()->findPreference('dataset_room_status_preference');
            if(empty($dataset_room_status_preference)) {
                $dataset_room_status_preference = new BOL_Preference();
            }

            $dataset_room_status_preference->key = 'dataset_room_status_preference';
            $dataset_room_status_preference->sortOrder = 4;
            $dataset_room_status_preference->sectionName = 'general';

            $this->assign('dataset_room_status', $data['dataset_room_status'] == "true" ? true : false);
            $spreadsheet_room_field->setValue($data['dataset_room_status']);
            $dataset_room_status_preference->defaultValue = $data['dataset_room_status'];

            BOL_PreferenceService::getInstance()->savePreference($dataset_room_status_preference);

        }
    }

    function liveExecuteCommand($cmd)
    {

        while (@ ob_end_flush()); // end all output buffers if any

        $proc = popen("$cmd 2>&1 ; echo Exit status : $?", 'r');

        $live_output     = "";
        $complete_output = "";

        while (!feof($proc))
        {
            $live_output     = fread($proc, 4096);
            $complete_output = $complete_output . $live_output;
            echo "$live_output";
            @ flush();
        }

        pclose($proc);

        // get exit status
        preg_match('/[0-9]+$/', $complete_output, $matches);

        // return exit status and intended output
        return array (
            'exit_status'  => $matches[0],
            'output'       => str_replace("Exit status : " . $matches[0], '', $complete_output)
        );
    }

}