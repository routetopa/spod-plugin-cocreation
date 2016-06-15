<?php

OW::getRouter()->removeRoute('cocreationep.index');

OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room_doc`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room_member`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_template`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room_datalet`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room_dataset`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room_postit`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room_sheet`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_room_metadata`;");
OW::getDbo()->query("DROP TABLE `" . OW_DB_PREFIX . "cocreation_dataset`;");
