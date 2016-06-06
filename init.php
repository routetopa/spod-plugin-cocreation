<?php
OW::getRouter()->addRoute(new OW_Route('cocreation.index', 'cocreation', "COCREATION_CTRL_Main", 'index'));
OW::getRouter()->addRoute(new OW_Route('cocreation.knowledge.room', 'cocreation/knowledge-room/:roomId', "COCREATION_CTRL_KnowledgeRoom", 'index'));
OW::getRouter()->addRoute(new OW_Route('cocreation.data.room', 'cocreation/data-room/:roomId', "COCREATION_CTRL_DataRoom", 'index'));
//Admin area
OW::getRouter()->addRoute(new OW_Route('cocreation-settings', '/cocreation/settings', 'COCREATION_CTRL_Admin', 'settings'));
