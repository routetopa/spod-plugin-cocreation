<?php

class COCREATION_CTRL_DataRoomList extends OW_ActionController
{

    public function index(array $params)
    {
        OW::getDocument()->addStyleSheet(OW::getPluginManager()->getPlugin('spodpublic')->getStaticCssUrl() . 'perfect-scrollbar.min.css');
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('spodpublic')->getStaticJsUrl() . 'perfect-scrollbar.jquery.js');

        $this->assign('components_url', SPODPR_COMPONENTS_URL);
    }
}