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

        $suggested_datasets = array();
        foreach($datasets as $dataset){
            $d = new stdClass();
            $metas = new stdClass();
            $metas->description = $dataset->description;

            $d->resource_name =  $dataset->name;
            $d->url           =  $dataset->url;
            $d->metas         =  json_encode($metas);
            array_push($suggested_datasets, $d);
        }

        $this->assign('components_url', SPODPR_COMPONENTS_URL);
        $this->assign('datasets_list', ODE_DATASET_LIST);

        $js = UTIL_JsGenerator::composeJsString('
                SPODPUBLICROOM = {}
                SPODPUBLICROOM.suggested_datasets       = {$cocreation_room_suggested_datasets}
            ', array(
               'numDataletsInRoom'                   => count(COCREATION_BOL_Service::getInstance()->getDataletsByRoomId($roomId)),
               'cocreation_room_suggested_datasets'  => json_encode($suggested_datasets)
        ));

        OW::getDocument()->addOnloadScript($js);
    }

}