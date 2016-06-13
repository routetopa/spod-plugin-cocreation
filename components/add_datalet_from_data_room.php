<?php

class COCREATION_CMP_AddDataletFromDataRoom extends OW_Component
{
    public function __construct($dataUrl)
    {
        $this->assign('components_url', SPODPR_COMPONENTS_URL);
        $this->assign('dataUrl', $dataUrl);

    }
}