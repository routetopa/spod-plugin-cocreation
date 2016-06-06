<?php

class COCREATION_CTRL_Admin extends ADMIN_CTRL_Abstract
{
    public function settings($params)
    {
        $this->setPageTitle(OW::getLanguage()->text('cocreation', 'admin_title'));
        $this->setPageHeading(OW::getLanguage()->text('cocreation', 'admin_heading'));

        $form = new Form('settings');
        $this->addForm($form);

        $submit = new Submit('add');

        $field = new HiddenField('running');
        $form->addElement($field);

        $connection = @fsockopen('localhost', '9001');

        if (is_resource($connection))
        {
            $submit->setValue('STOP');
            $this->assign('running', true);
            $field->setValue(1);
        }
        else
        {
            $submit->setValue('START');
            $this->assign('running', false);
            $field->setValue(0);
        }

        $form->addElement($submit);

        if ( OW::getRequest()->isPost() && $form->isValid($_POST))
        {
            $data = $form->getValues();

            $preference = BOL_PreferenceService::getInstance()->findPreference('cocreation_admin_run_status');

            if(empty($preference))
                $preference = new BOL_Preference();

            $preference->key = 'cocreation_admin_run_status';
            $preference->sortOrder = 1;
            $preference->sectionName = 'general';

            chdir(OW::getPluginManager()->getPlugin('cocreation')->getStaticDir() . '/ether-etherpad-lite/bin');
            if($data['running'])
            {
                //is running
                $submit->setValue('START');
                $this->assign('running', false);
                $field->setValue(0);

                shell_exec("/usr/bin/sudo /usr/bin/service etherpad-lite stop");
                $preference->defaultValue = 'STOP';
            }
            else
            {
                //is not running
                $output = shell_exec("/usr/bin/sudo /usr/bin/service etherpad-lite start");
                //$this->liveExecuteCommand("sh ./run.sh");
                $preference->defaultValue = 'RUN';

                $submit->setValue('STOP');
                $this->assign('running', true);
                $field->setValue(1);
            }
            BOL_PreferenceService::getInstance()->savePreference($preference);
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