<?php

class COCREATION_BOL_RoomDataletDao extends OW_BaseDao
{

    /**
     * Constructor.
     *
     */
    protected function __construct()
    {
        parent::__construct();
    }
    /**
     * Singleton instance.
     *
     * @var COCREATION_BOL_RoomDataletDao
     */
    private static $classInstance;

    /**
     * Returns an instance of class (singleton pattern implementation).
     *
     * @return COCREATION_BOL_RoomDataletDao
     */
    public static function getInstance()
    {
        if ( self::$classInstance === null )
        {
            self::$classInstance = new self();
        }

        return self::$classInstance;
    }

    /**
     * @see OW_BaseDao::getDtoClassName()
     *
     */
    public function getDtoClassName()
    {
        return 'COCREATION_BOL_RoomDatalet';
    }

    /**
     * @see OW_BaseDao::getTableName()
     *
     */
    public function getTableName()
    {
        return OW_DB_PREFIX . 'cocreation_room_datalet';
    }
}