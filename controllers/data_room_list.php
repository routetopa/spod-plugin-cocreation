<?php

class COCREATION_CTRL_DataRoomList extends OW_ActionController
{

    public function index(array $params)
    {
        OW::getDocument()->addStyleSheet(OW::getPluginManager()->getPlugin('spodpublic')->getStaticCssUrl() . 'perfect-scrollbar.min.css');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('spodpublic')->getStaticJsUrl() . 'perfect-scrollbar.jquery.js');

        $js = UTIL_JsGenerator::composeJsString('
                ODE.ajax_coocreation_get_dataset      = {$ajax_coocreation_get_dataset}
                ODE.ajax_coocreation_get_dataset_docs = {$ajax_coocreation_get_dataset_docs}
            ', array(
            'ajax_coocreation_get_dataset'      => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getDatasetByRoomIdAndVersion'),
            'ajax_coocreation_get_dataset_docs' => OW::getRouter()->urlFor('COCREATION_CTRL_Ajax', 'getDatasetDocByRoomIdAndVersion'),
        ));
        OW::getDocument()->addOnloadScript($js);
        
        $this->assign('datasets', $this->formatDatasetData());
        $this->assign('components_url', SPODPR_COMPONENTS_URL);
    }

    public function formatDatasetData()
    {
        $raw_data = COCREATION_BOL_Service::getInstance()->getAllDatasets();
        $dataset = array();

        foreach ($raw_data as $data)
        {
            $data->owners = substr($data->owners, 1, -1);
            $data->owners = str_replace('\\', "", $data->owners);
            $users = json_decode($data->owners);
            $avatars = array();

            foreach ($users as $user)
            {
                $avatar = BOL_AvatarService::getInstance()->getDataForUserAvatars(array($user));
                $avatars[] = array("src" => $avatar[$user]["src"], "href" => $avatar[$user]["url"]);
            }

            $common_core_required_metadata = json_decode($data->common_core_required_metadata);

            $dataset[] = array("ID" => $data->roomId,
                               "VER" => $data->version,
                               "USER" => $avatars,
                               "NAME" => !empty($common_core_required_metadata->title) ? $common_core_required_metadata->title : '',
                               "DATA" => date('d/m/Y', strtotime($data->timestamp)),
                               "DESCRIPTION" => !empty($common_core_required_metadata->description) ? $common_core_required_metadata->description : ''
                );
        }

        return json_encode($dataset);
    }
}