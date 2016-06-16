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

        $document_field    = new HiddenField('document_server_status');
        $spreadsheet_field = new HiddenField('spreadsheet_server_status');
        $form->addElement($document_field);
        $form->addElement($spreadsheet_field);

        $doc_connection    = @fsockopen('localhost', '9001');
        $spread_connection = @fsockopen('localhost', '8001');

        if (is_resource($doc_connection))
        {
            $this->assign('document_server_status', true);
            $document_field->setValue(1);
        }
        else
        {
            $this->assign('document_server_status', false);
            $document_field->setValue(0);
        }

        if (is_resource($spread_connection))
        {
            $this->assign('spreadsheet_server_status', true);
            $spreadsheet_field->setValue(1);
        }
        else
        {
            $this->assign('spreadsheet_server_status', false);
            $spreadsheet_field->setValue(0);
        }

        $submit->setValue('SAVE');
        $form->addElement($submit);

        if ( OW::getRequest()->isPost() && $form->isValid($_POST) )
        {
            $data = $form->getValues();

            $document_server_status_preference = BOL_PreferenceService::getInstance()->findPreference('document_server_status_preference');
            if(empty($document_server_status_preference)) {
                $document_server_status_preference = new BOL_Preference();
            }

            $document_server_status_preference->key = 'document_server_status_preference';
            $document_server_status_preference->sortOrder = 1;
            $document_server_status_preference->sectionName = 'general';

            if($data['document_server_status'])
            {
                //is running
                $this->assign('document_server_status', false);
                $document_field->setValue(0);
                shell_exec("/usr/bin/sudo /usr/bin/service etherpad-lite stop");
                $document_server_status_preference->defaultValue = 'STOP';
            }
            else
            {
                //is not running
                shell_exec("/usr/bin/sudo /usr/bin/service etherpad-lite start");
                $document_server_status_preference->defaultValue = 'RUN';
                $this->assign('document_server_status', true);
                $document_field->setValue(1);
            }

            BOL_PreferenceService::getInstance()->savePreference($document_server_status_preference);

            $spreadsheet_server_status_preference = BOL_PreferenceService::getInstance()->findPreference('spreadsheet_server_status_preference');
            if(empty($spreadsheet_server_status_preference)) {
                $spreadsheet_server_status_preference = new BOL_Preference();
            }

            $spreadsheet_server_status_preference->key = 'spreadsheet_server_status_preference';
            $spreadsheet_server_status_preference->sortOrder = 1;
            $spreadsheet_server_status_preference->sectionName = 'general';

            if($data['spreadsheet_server_status'])
            {
                //is running
                $this->assign('spreadsheet_server_status', false);
                $spreadsheet_field->setValue(0);
                shell_exec("/usr/bin/sudo /usr/bin/service ethersheet stop");
                $spreadsheet_server_status_preference->defaultValue = 'STOP';
            }
            else
            {
                //is not running
                shell_exec("/usr/bin/sudo /usr/bin/service ethersheet start");
                $spreadsheet_server_status_preference->defaultValue = 'RUN';
                $this->assign('spreadsheet_server_status', true);
                $spreadsheet_field->setValue(1);
            }

            BOL_PreferenceService::getInstance()->savePreference($spreadsheet_server_status_preference);
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