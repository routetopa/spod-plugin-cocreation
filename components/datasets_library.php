<?php

/**
 * Created by PhpStorm.
 * User: Utente
 * Date: 01/03/2016
 * Time: 16.08
 */
class COCREATION_CMP_DatasetsLibrary extends OW_Component
{
    public function __construct($roomId)
    {
        //get all dataset for current room
        $datasets = COCREATION_BOL_Service::getInstance()->getDatasetsByRoomId($roomId);
        $this->assign('datasets', $datasets);

        $suggested_datasets_string = '[';
        //foreach($datasets as $dataset) $suggested_datasets_string .= '{"name":"' . $dataset->name .'","url": "' . $dataset->url .'","description" : "' . $dataset->name .'"},';
        foreach($datasets as $dataset) $suggested_datasets_string .= '{"resource_name":"' . $dataset->name .'","url": "' . $dataset->url .'","metas" : { "description" : "' . $dataset->name .'"}},';
        $suggested_datasets_string = rtrim($suggested_datasets_string, ",") . ']';

        $this->assign('components_url', SPODPR_COMPONENTS_URL);
        $this->assign('datasets_list', ODE_DATASET_LIST);

        $js = UTIL_JsGenerator::composeJsString('
                SPODPUBLICROOM = {}
                SPODPUBLICROOM.suggested_datasets       = {$coocreation_room_suggested_datasets}
            ', array(
            'numDataletsInRoom'                   => count(COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($roomId)),
            'coocreation_room_suggested_datasets' => $suggested_datasets_string
        ));

        OW::getDocument()->addOnloadScript($js);
    }

}