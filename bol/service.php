<?php

class COCREATION_BOL_Service
{
    const ROOM_ENTITY_TYPE    = 'cocreation_room_entity';
    const COMMENT_ENTITY_TYPE = 'cocreation_comment_entity';

    private static $classInstance;
    private $sheetDBconnection;

    public static function getInstance()
    {
        if ( self::$classInstance === null )
        {
            self::$classInstance = new self();
        }

        return self::$classInstance;
    }

    private function __construct()
    {
        $this->sheetDBconnection = new PDO("mysql:host=localhost;dbname=ethersheet;",
                                           "root",
                                           "is15rdc",
                                           array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8;',
                                                 PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true)
        );
    }

    public function getSheetData($sheetName){
        $data = array();

        try {
            $stmt = $this->sheetDBconnection->query("SELECT * FROM store WHERE store.key LIKE '%" . $sheetName . "%'");
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $result = json_decode($result[0]['value']);

            $stmt = $this->sheetDBconnection->query("SELECT * FROM store WHERE store.key LIKE '%" . $result[0] . "%'");
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $rows = json_decode($result[0]['value'], true);
            $cols = json_decode($result[1]['value'], true);
            $cells = json_decode($result[2]['value'], true);

            foreach($cols as $col){
                if( $cells[$rows[0]][$col]['value'] == "") break;
                $obj = new stdClass();
                $obj->name =  $cells[$rows[0]][$col]['value'];
                $obj->data = array();
                array_push($data, $obj);
            }

            for($i = 1; $i < $rows; $i++){
                $wrong_values = 0;
                for($j = 0; $j < count($data); $j++){
                    if($cells[$rows[$i]][$cols[$j]]['value'] == "") {$wrong_values++; continue;};
                    if($cells[$rows[$i]][$cols[$j]]['type'] == 'string')
                        array_push($data[$j]->data, $cells[$rows[$i]][$cols[$j]]['value']);
                    else
                        array_push($data[$j]->data, intval($cells[$rows[$i]][$cols[$j]]['value']));
                }
                if($wrong_values == count($data)) break;
            }

        }catch (PDOException $e){
            return null;
        }

        return $data;
    }

    public function getArrayOfObjectSheetData($sheetName){
        $data = array();

        try {
            $stmt = $this->sheetDBconnection->query("SELECT * FROM store WHERE store.key LIKE '%" . $sheetName . "%'");
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $result = json_decode($result[0]['value']);

            $stmt = $this->sheetDBconnection->query("SELECT * FROM store WHERE store.key LIKE '%" . $result[0] . "%'");
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $rows = json_decode($result[0]['value'], true);
            $cols = json_decode($result[1]['value'], true);
            $cells = json_decode($result[2]['value'], true);

            if($rows[0] == null){
                $cells = $rows;
                $rows  = array_keys($rows);
            }

            $headers = array();
            foreach($cols as $col){
                if($cells[$rows[0]][$col]['value'] == "") break;
                array_push($headers, $cells[$rows[0]][$col]['value']);
            }

            for($i = 1; $i < $rows; $i++){
                $wrong_values = 0;
                $obj = new stdClass();
                for($j = 0; $j < count($headers); $j++){
                    if($cells[$rows[$i]][$cols[$j]]['value'] == "") {$wrong_values++; continue;};
                    if($cells[$rows[$i]][$cols[$j]]['type'] == 'string')
                        $obj->{$headers[$j]} = $cells[$rows[$i]][$cols[$j]]['value'];
                    else
                        $obj->{$headers[$j]} = floatval($cells[$rows[$i]][$cols[$j]]['value']);
                }
                if($wrong_values == count($headers)) break;
                array_push($data, $obj);
            }

        }catch (PDOException $e){
            return null;
        }

        return $data;
    }

    public function addSheetToRoom($roomId, $description, $url){
        $roomSheet = new COCREATION_BOL_RoomSheet();

        $roomSheet->roomId      = $roomId;
        $roomSheet->description = $description;
        $roomSheet->url         = $url;

        COCREATION_BOL_RoomSheetDao::getInstance()->save($roomSheet);
    }

    public function createMetadataForRoom($roomId){
        $roomMetadata = new COCREATION_BOL_RoomMetadata();

        $common_core_required = array(
           "title"               => "",
           "description"         => "",
           "tags"                => "",
           "last_update"         => "",
           "publisher"           => "",
           "contact_name"        => "",
           "contact_email"       => "",
           "unique_identifier"   => "",
           "public_access_level" => ""
        );

        $common_core_if_applicable = array(
            "bureau_code"          => "",
            "program_code"         => "",
            "access_level_comment" => "",
            "download_url"         => "",
            "endpoint"             => "",
            "format"               => "",
            "license"              => "",
            "spatial"              => "",
            "temporal"             => ""
        );

        $expanded = array(
            "category"                  => "",
            "data_dictionary"           => "",
            "data_quality"              => "",
            "distribution"              => "",
            "frequency"                 => "",
            "homepage_url"              => "",
            "language"                  => "",
            "primary_IT_investment_UII" => "",
            "related_documents"         => "",
            "release_date"              => "",
            "system_of_records"         => "",
        );


        $roomMetadata->roomId                     = $roomId;
        $roomMetadata->common_core_required       = json_encode($common_core_required);
        $roomMetadata->common_core_if_applicable  = json_encode($common_core_if_applicable);
        $roomMetadata->expanded                   = json_encode($expanded);

        COCREATION_BOL_RoomMetadataDao::getInstance()->save($roomMetadata);
    }

    public function updateMetadata($roomId, $ccr, $ccia, $e)
    {
        return COCREATION_BOL_RoomMetadataDao::getInstance()->updateMetadata($roomId,$ccr,$ccia, $e);
    }

    public function getSheetByRoomId($roomId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('roomId', $roomId);
        $result = COCREATION_BOL_RoomSheetDao::getInstance()->findListByExample($example);
        return $result;
    }

    public function getMatadatasByRoomId($roomId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('roomId', $roomId);
        $result = COCREATION_BOL_RoomMetadataDao::getInstance()->findListByExample($example);
        return $result;
    }

    public function getAllTemplates()
    {
        return COCREATION_BOL_TemplateDao::getInstance()->findAll();
    }

    public function  getAllRooms()
    {
        return COCREATION_BOL_RoomDao::getInstance()->findAll();
    }

    public function getRoomById($id){
        $example = new OW_Example();
        $example->andFieldEqual('id', $id);
        $result = COCREATION_BOL_RoomDao::getInstance()->findObjectByExample($example);
        return $result;
    }

    public function addTemplate($name, $description, $url)
    {
        $template = new COCREATION_BOL_Template();

        $template->name        = $name;
        $template->description = $description;
        $template->url         = $url;

        COCREATION_BOL_TemplateDao::getInstance()->save($template);
    }

    public function removeTemplate($id)
    {
        COCREATION_BOL_TemplateDao::getInstance()->deleteById($id);
    }

    public function addUserToRoom($roomId, $email, $userId, $isJoined = 0)
    {
        $roomMember = new COCREATION_BOL_RoomMember();

        $roomMember->roomId   = $roomId;
        $roomMember->email    = $email;
        $roomMember->isJoined = $isJoined;
        $roomMember->userId   = $userId;

        COCREATION_BOL_RoomMemberDao::getInstance()->save($roomMember);
    }

    public function getRoomMembers($roomId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('roomId', $roomId);
        $result = COCREATION_BOL_RoomMemberDao::getInstance()->findListByExample($example);
        return $result;
    }

    public function memberJoinToRoom($memberId, $roomId){
        COCREATION_BOL_RoomMemberDao::getInstance()->updateJoin($memberId, $roomId);
    }

    public function isMemberJoinedToRoom($memberId, $roomId){
        $example = new OW_Example();
        $example->andFieldEqual('userId', intval($memberId));
        $example->andFieldEqual('roomId', intval($roomId));
        $result = COCREATION_BOL_RoomMemberDao::getInstance()->findListByExample($example);
        if(count($result) == 0) return false;
        return ($result[0]->isJoined == "1") ? true : false;
    }

    public function addDocToRoom($roomId, $templateId, $description, $url)
    {
        $roomDoc = new COCREATION_BOL_RoomDoc();

        $roomDoc->roomId      = $roomId;
        $roomDoc->description = $description;
        $roomDoc->url         = $url;
        $roomDoc->templateId  = $templateId;

        COCREATION_BOL_RoomDocDao::getInstance()->save($roomDoc);
    }

    public function getAllDocuments()
    {
        return COCREATION_BOL_RoomDocDao::getInstance()->findAll();
    }

    public function getDocumentsByRoomId($roomId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('roomId', $roomId);
        $result = COCREATION_BOL_RoomDocDao::getInstance()->findListByExample($example);
        return $result;
    }

    public function addRoom($ownerId, $name, $subject,
                            $description, $from, $to,
                            $goal, $invitationText, $isOpen,
                            $invitedUserArray, $roomType)
    {

        $room = new COCREATION_BOL_Room();

        $room->ownerId        = $ownerId;
        $room->name           = $name;
        $room->subject        = $subject;
        $room->description    = $description;
        $room->from           = $from;
        $room->to             = $to;
        $room->goal           = $goal;
        $room->invitationText = $invitationText;
        $room->isOpen         = $isOpen;
        $room->type           = $roomType;

        COCREATION_BOL_RoomDao::getInstance()->save($room);

        foreach($invitedUserArray as $user)
        {
            $u   = BOL_UserService::getInstance()->findByEmail($user);
            if($u->id != NULL) $this->addUserToRoom($room->id, $user, $u->id);
        }

        return $room;

        //$this->addDocToRoom($room->id, $templateId);
    }

    public function addDataletToRoom($roomId, $dataletId){
        $datalet = new COCREATION_BOL_RoomDatalet();

        $datalet->roomId    = $roomId;
        $datalet->dataletId = $dataletId;

        COCREATION_BOL_RoomDataletDao::getInstance()->save($datalet);

    }

    public function getDataletsByRoomId($roomId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('roomId', $roomId);
        $result = COCREATION_BOL_RoomDataletDao::getInstance()->findListByExample($example);
        return $result;
    }

    public function addDatasetToRoom($roomId, $url, $name, $description, $fields){
        $dataset = new COCREATION_BOL_RoomDataset();

        $dataset->roomId      = $roomId;
        $dataset->url         = $url;
        $dataset->name        = $name;
        $dataset->description = $description;
        $dataset->fields      = $fields;

        COCREATION_BOL_RoomDatasetDao::getInstance()->save($dataset);
    }

    public function getDatasetsByRoomId($roomId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('roomId', $roomId);
        $result = COCREATION_BOL_RoomDatasetDao::getInstance()->findListByExample($example);
        return $result;
    }

    public function addPostitToDataletInRoom($roomId, $dataletId, $title, $content){

        $postit = new COCREATION_BOL_RoomPostit();

        $postit->roomId      = $roomId;
        $postit->dataletId   = $dataletId;
        $postit->title       = htmlspecialchars($title, ENT_QUOTES);
        $postit->content     = htmlspecialchars($content, ENT_QUOTES);

        COCREATION_BOL_RoomPostitDao::getInstance()->save($postit);
    }

    public function getPostitByDataletId($dataletId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('dataletId', $dataletId);
        $result = COCREATION_BOL_RoomPostitDao::getInstance()->findListByExample($example);
        for($i=0;$i < count($result);$i++) $result[$i]->content = htmlspecialchars($result[$i]->content);
        return $result;
    }

    public function addDataset($roomId,
                               $owners,
                               $datasetId,
                               $data,
                               $notes,
                               $common_core_required_metadata,
                               $common_core_if_applicable_metadata,
                               $expanded_metadata)
    {
        //get last version and up it
        $version = 1;
        $result = $this->getDatasetsByDatasetId($datasetId);
        if(count($result) > 0){
            $version = $result[count($result) - 1]->version + 1;
        }

        $dataset = new COCREATION_BOL_Dataset();

        $dataset->roomId                             = $roomId;
        $dataset->owners                             = json_encode($owners);
        $dataset->datasetId                          = $datasetId;
        $dataset->version                            = $version;
        $dataset->data                               = $data;
        $dataset->notes                              = $notes;
        $dataset->common_core_required_metadata      = json_encode($common_core_required_metadata);
        $dataset->common_core_if_applicable_metadata = json_encode($common_core_if_applicable_metadata);
        $dataset->expanded_metadata                  = json_encode($expanded_metadata);

        COCREATION_BOL_DatasetDao::getInstance()->save($dataset);
    }

    public function  getAllDatasets()
    {
        $sql = "SELECT * FROM ". OW_DB_PREFIX ."cocreation_dataset order by roomId DESC, version DESC";
        return OW::getDbo()->queryForObjectList($sql, 'COCREATION_BOL_Dataset');
    }

    public function  getDatasetByRoomIdAndVersion($roomId, $version)
    {
        $ex = new OW_Example();
        $ex->andFieldEqual('roomId', $roomId);
        $ex->andFieldEqual('version', $version);
        return COCREATION_BOL_DatasetDao::getInstance()->findObjectByExample($ex);
    }

    public function getDatasetsByDatasetId($datasetId)
    {
        $example = new OW_Example();
        $example->andFieldEqual('datasetId', $datasetId);
        $result = COCREATION_BOL_DatasetDao::getInstance()->findListByExample($example);
        return $result;
    }
}
