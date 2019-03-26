<?php

class COCREATION_CMP_PrivacyChecker extends OW_Component
{
    public function __construct($data, $styling)
    {
        $this->assign('components_url', SPODPR_COMPONENTS_URL);
        $this->assign('data', str_replace("'", "&#39;", $data));
        //$this->assign('addictionalInfo', str_replace("'", "&#39;", $addictionalInfo));
        $this->assign('styling', str_replace("'", "&#39;", $styling));
    }
}