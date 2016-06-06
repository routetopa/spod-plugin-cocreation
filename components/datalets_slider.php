<?php

class COCREATION_CMP_DataletsSlider extends OW_Component
{
    public function __construct($roomId)
    {
        OW::getDocument()->addScript(OW::getPluginManager()->getPlugin('cocreation')->getStaticUrl() . 'components/js/' . 'dataletsSlider.js', 'text/javascript');

        //get all datalets in the room
        $datalets = COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($roomId);
        $room_datalets = array();
        foreach($datalets as $d){
            $datalet         =  ODE_BOL_Service::getInstance()->getDataletById($d->dataletId);
            $datalet->params = json_decode($datalet->params);
            $datalet->data   = str_replace("'","&#39;", $datalet->data);
            $datalet->fields = str_replace("'","&#39;", $datalet->fields);
            array_push($room_datalets, $datalet);
        }

        $this->assign('datalets', $room_datalets);

        //get all postits for each datalet
        $postits = array();
        foreach($room_datalets as $datalet){
            $datalet_postits = COCREATION_BOL_Service::getInstance()->getPostitByDataletId($datalet->id);
            $postits[$datalet->id] = json_encode($datalet_postits);
        }
        $this->assign('postits', $postits);
        $this->assign('components_url', SPODPR_COMPONENTS_URL);

        /* ODE */
        //if (OW::getPluginManager()->isPluginActive('spodpr'))
        $this->addComponent('private_room', new SPODPR_CMP_PrivateRoomCard('ow_attachment_btn', array('datalet'), "cocreation"));
        /* ODE */

        $js = UTIL_JsGenerator::composeJsString('
                ODE.numDataletsInCocreationRooom       = {$numDataletsInRoom}
            ', array(
            'numDataletsInRoom' => count($room_datalets)
        ));

        OW::getDocument()->addOnloadScript($js);
    }

}