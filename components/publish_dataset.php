<?php

class COCREATION_CMP_PublishDataset extends OW_Component
{
    public function __construct($data)
    {
        $this->assign('components_url', SPODPR_COMPONENTS_URL);
        $this->assign('data', $data);

    }
}