METADATA = {
    form:null
};

METADATA.init = function()
{
    METADATA.create_form();
};

METADATA.realtime_metadata = function (data)
{
    METADATA.form.submission = {
        data: JSON.parse(data)
    };
};

METADATA.loadTheme = function(theme)
{
    if(!theme) return;
    return THEMES[theme];
};

METADATA.create_form = function()
{
    Formio.createForm(document.getElementById('dcat_ap_it_form'), {
        components: [

            // TITOLO
            {
                type: 'textfield',
                key: 'dct_title',
                label: 'Titolo',
                placeholder: 'Titolo dataset',
                input: true,
                validate: {
                    required: true
                }
            },

            // IDENTIFICATIVO
            {
                type: 'textfield',
                key: 'dct_identifier',
                label: 'Identificativo',
                placeholder: 'Identificativo del dataset',
                input: true,
                validate: {
                    required: true
                }
            },

            // ALTRO IDENTIFICATIVO
            {
                input: true,
                components: [
                    {
                        type: 'textfield',
                        key: 'othid_identifier',
                        label: 'Identificativo del dataset',
                        placeholder: 'Identificativo del dataset',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'othid_organization_name',
                        label: 'Nome organizzazione',
                        placeholder: 'Nome organizzazione',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'othid_organization_identifier',
                        label: 'Identificativo dell\'organizzazione',
                        placeholder: 'Identificativo dell\'organizzazione',
                        input: true,
                        validate: {
                            required: false
                        }
                    }],
                label: 'Altro identificativo',
                key: 'adms_identifier',
                type: 'datagrid'
            },

            // TEMA
            {
                input: true,
                components: [{
                    type: "select",
                    label: "Tema del dataset",
                    key: "dcat_theme",
                    placeholder: "Tema del dataset",
                    data: {
                        custom: "values = METADATA.loadTheme('main_theme')"
                    },
                    dataSrc: "custom",
                    template: "<span>{{ item.label }}</span>",
                    multiple: false,
                    input: true
                },
                {
                    type: "select",
                    label: "Sottotema del dataset",
                    key: "dct_subject",
                    placeholder: "Sottotema del dataset",
                    data: {
                        custom: "values = METADATA.loadTheme(data.dcat_theme.value)"
                    },
                    dataSrc: "custom",
                    template: "<span>{{ item.label }}</span>",
                    multiple: true,
                    refreshOn: 'dct_subject',
                    input: true
                }],
                tableView: true,
                label: 'Tema',
                key: 'dcat_theme-dct_subject',
                type: 'datagrid'
            },

            // EDITORE
            {
                input: false,
                columns: [
                    {
                        components: [
                            {
                                type: 'textfield',
                                label: 'Editore del dataset',
                                key: 'dct_publisher',
                                placeholder: 'Editore del dataset',
                                input: true,
                                validate: {
                                    required: false
                                }
                            }
                        ]
                    },
                    {
                        components: [
                            {
                                type: 'textfield',
                                label: 'IPA/IVA',
                                key: 'dataset_ipa_iva',
                                placeholder: 'IPA/IVA',
                                input: true,
                                validate: {
                                    required: false
                                },

                            }
                        ]
                    }
                ],
                type: 'columns',
                key: 'columns'
            },

            // DATA DI RILASCIO
            {
                type: 'datetime',
                key: 'dct_issued',
                label: 'Data di rilascio',
                placeholder: 'Data di rilascio',
                datepickerMode: 'day',
                enableDate: true,
                enableTime: false,
                format: 'dd-MM-yyyy',
                input: true,
                tooltip: 'Tooltip data di rilascio',
                description: 'Data di rilascio',
                validate: {
                    required: true
                }
            },

            // DATA ULTIMA MODIFICA
            {
                type: 'datetime',
                key: 'dct_modified',
                label: 'Data di ultima modifica',
                placeholder: 'Data di ultima modifica',
                datepickerMode: 'day',
                enableDate: true,
                enableTime: false,
                format: 'dd-MM-yyyy',
                input: true,
                tooltip: 'Tooltip data di ultima modifica',
                description: 'Data di ultima modifica',
                validate: {
                    required: false
                }
            },

            //COPERTURA GEOGRAFICA
            {
                type: "select",
                label: "Copertura geografica",
                key: "dct_spatial",
                placeholder: "Copertura geografica",
                data: {
                    custom : "values = COVERAGE.coverage"
                },
                dataSrc: "custom",
                template: "<span>{{ item.label }}</span>",
                multiple: true,
                input: true
            },

            // Geographical Name
            {
                input: false,
                columns: [
                    {
                        components: [
                            {
                                input: true,
                                tableView: true,
                                inputType: 'text',
                                inputMask: '',
                                label: 'Name of place',
                                key: 'locn_geographicalName',
                                placeholder: 'Name of place',
                                multiple: false,
                                defaultValue: '',
                                protected: false,
                                unique: false,
                                persistent: true,
                                validate: {
                                    required: false
                                },
                                type: 'textfield'
                            }
                        ]
                    },
                    {
                        components: [
                            {
                                input: true,
                                tableView: true,
                                inputType: 'text',
                                inputMask: '',
                                label: 'Geonames ULR',
                                key: 'dcatapit_geographicalIdentifier',
                                placeholder: 'Geonames URL',
                                multiple: false,
                                defaultValue: '',
                                protected: false,
                                unique: false,
                                persistent: true,
                                validate: {
                                    required: false
                                },
                                type: 'textfield'
                            }
                        ]
                    }
                ],
                type: 'columns',
                key: 'columns'
            },

            // LINGUA
            {
                type: "select",
                label: "Lingua del dataset",
                key: "dct_language",
                placeholder: "Lingua del dataset",
                data: {
                    values: [
                        {
                            value: "it",
                            label: "Italiano"
                        },
                        {
                            value: "en",
                            label: "Inglese"
                        },
                        {
                            value: "fr",
                            label: "Francese"
                        },
                        {
                            value: "de",
                            label: "Tedesco"
                        }
                    ]
                },
                validate: {
                    required: false
                },
                dataSrc: "values",
                template: "<span>{{ item.label }}</span>",
                multiple: true,
                input: true
            },

            // PERIOD OF TIME - (INIZIO - FINE)
            {
                input: true,
                tree: true,
                components: [{
                    type: 'datetime',
                    key: 'dct_period_of_time-schema_start_date',
                    label: 'Data di ultima modifica',
                    placeholder: 'Data di ultima modifica',
                    datepickerMode: 'day',
                    enableDate: true,
                    enableTime: false,
                    format: 'dd-MM-yyyy',
                    input: true,
                    tooltip: 'Tooltip data di ultima modifica',
                    description: 'Data di inizio',
                    validate: {
                        required: false
                    }
                }, {
                    type: 'datetime',
                    key: 'dct_period_of_time-schema_end_date',
                    label: 'Data di ultima modifica',
                    placeholder: 'Data di ultima modifica',
                    datepickerMode: 'day',
                    enableDate: true,
                    enableTime: false,
                    format: 'dd-MM-yyyy',
                    input: true,
                    tooltip: 'Tooltip data di ultima modifica',
                    description: 'Data di fine',
                    validate: {
                        required: false
                    }
                }],
                tableView: true,
                label: 'Estensione temporale',
                key: 'dct_temporal',
                type: 'datagrid'
            },

            // RIGHTS HOLDER
            {
                type: 'textfield',
                key: 'dct_rightsHolder',
                label: 'Titolare del dataset',
                placeholder: 'Titolare del dataset',
                input: true,
                validate: {
                    required: true
                }
            },

            // ACCRUAL PERIODICITY
            {
                type: 'select',
                key: 'dct_accrualPeriodicity',
                label: 'Frequenza di aggiornamento',
                placeholder: 'Frequenza di aggiornamento',
                template: '{{ item.label }}',
                multiple: true,
                dataSrc: "custom",
                input: true,
                data: {
                    custom: "values = FREQUENCY.frequency"
                },
                validate: {
                    required: false
                }
            },

            // VERSION
            {
                type: 'textfield',
                key: 'owl_versionInfo',
                label: 'Versione',
                placeholder: 'Versione',
                input: true,
                validate: {
                    required: true
                }
            },

            // CONFORMS TO (IDENTIFICATORE - TITOLO - DESCRIZIONE - URI)
            {
                input: true,
                components: [{
                    type: 'textfield',
                    key: 'dct_standards-dct_identifier',
                    label: 'Identificatore',
                    placeholder: 'Identificatore',
                    input: true,
                    validate: {
                        required: true
                    }
                }, {
                    type: 'textfield',
                    key: 'dct_standards-dct_title',
                    label: 'Titolo',
                    placeholder: 'Titolo',
                    input: true,
                    validate: {
                        required: true
                    }
                },
                    {
                        type: 'textfield',
                        key: 'dct_standards-dct_description',
                        label: 'Description',
                        placeholder: 'Description',
                        input: true,
                        validate: {
                            required: true
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'dct_standards-referenceDocumentation_URI',
                        label: 'Documentation URI',
                        placeholder: 'Documentation URI',
                        input: true,
                        validate: {
                            required: true
                        }
                    }],
                label: 'Conformità',
                key: 'dct_conformsTo',
                type: 'datagrid'
            },

            // CREATOR
            {
                input: true,
                components: [
                    {
                        type: 'textfield',
                        key: 'foaf_agent-dct_identifier',
                        label: 'Identificativo',
                        placeholder: 'Identificativo',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'foaf_agent-foaf_name',
                        label: 'Nome',
                        placeholder: 'Nome',
                        input: true,
                        validate: {
                            required: false
                        }
                    }],
                label: 'Creatore',
                key: 'dct_creator',
                type: 'datagrid'
            },

            // DESCRIPTION
            {
                type: 'textarea',
                label: 'Descrizione',
                placeholder: 'Descrizione',
                defaultValue: '',
                key: 'dct_description',
                input: true
            },

            // KEYWORD
            {
                type: 'textfield',
                key: 'dcat_keyword',
                label: 'Parole chiave',
                placeholder: 'Parole chiave',
                input: true,
                validate: {
                    required: false
                }
            },

            // LICENSE
            {
                type: 'select',
                key: 'dct_license',
                label: 'Licenza',
                placeholder: 'Licenza',
                template: '{{ item.label }}',
                multiple: false,
                dataSrc: "custom",
                input: true,
                data: {
                    custom: "values =  LICENSE.license"
                },
            },

            // PUBLISHER
            {
                type: 'textfield',
                key: 'dct_publisher',
                label: 'Editore del dataset',
                placeholder: 'Editore del dataset',
                input: true,
                validate: {
                    required: true
                }
            },

            // AUTHOR
            {
                type: 'textfield',
                key: 'dct_creator',
                label: 'Autore del dataset',
                placeholder: 'Autore del dataset',
                input: true,
                validate: {
                    required: false
                }
            },

            // DISTRIBUTION TITLE
            {
                type: 'textfield',
                key: 'distribution_dct_title',
                label: 'Titolo distribuzione',
                placeholder: 'Titolo distribuzione',
                input: true,
                validate: {
                    required: true
                }
            },

            // DISTRIBUTION DESCRIPTION
            {
                type: 'textarea',
                key: 'distribution_dct_description',
                label: 'Descrizione distribuzione',
                placeholder: 'Descrizione distribuzione',
                defaultValue: '',
                input: true
            },

            // DISTRIBUTION FORMAT
            {
                type: 'select',
                key: 'dct_format',
                label: 'Formato',
                placeholder: 'Formato',
                template: '{{ item.label }}',
                multiple: false,
                dataSrc: 'values',
                input: true,
                data: {
                    custom: '',
                    resource: '',
                    url: '',
                    json: '',
                    values: [
                        {
                            label: 'CSV',
                            value: 'csv'
                        },
                        {
                            label: 'XML',
                            value: 'xml'
                        }
                    ]
                }
            },

            // UPDATE MODIFICATION DATE
            {
                type: 'datetime',
                key: 'dct_modified',
                label: 'Ultima modifica della distribuzione',
                placeholder: 'Ultima modifica della distribuzione',
                datepickerMode: 'day',
                enableDate: true,
                enableTime: false,
                format: 'dd-MM-yyyy',
                input: true,
                tooltip: 'Tooltip data ',
                description: 'Data ultima modifica',
                validate: {
                    required: false
                }
            },

            // DIMENSIONE IN BYTE
            {
                type: 'textfield',
                key: 'dcat_byteSize',
                label: 'Dimensione in byte',
                placeholder: 'Dimensione in byte',
                defaultValue: '',
                input: true
            },

            {
                type: 'button',
                action: 'submit',
                label: 'Submit',
                theme: 'primary'
            },
            /*{
                type: 'button',
                action: 'reset',
                label: 'Reset Form',
                theme: 'success'
            }*/
        ]
    }).then(function(form)
    {
        METADATA.form = form;

        METADATA.form.submission = {
            data: JSON.parse(this.parent.COCREATION.metadata)
        };

        METADATA.form.on('submit', (submission) => {
            this.parent.window.dispatchEvent(new CustomEvent('metadata-list-controllet_update-metadata', {detail: { metadata: submission.data} }));
        });

        // Everytime the form changes, this will fire.
        METADATA.form.on('change', function(changed) {
            console.log('Form was changed', changed);
        });

        /*Formio.request('./datasource/themes/themes.json', "GET", null, null, null).then((data)=>{
            console.log('DATA');
            console.log(data);
            console.log('DATA');
        });*/
    });
};

METADATA.init();