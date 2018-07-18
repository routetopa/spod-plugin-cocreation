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
    let components = [

        {
            theme:'primary',
            type: 'panel',
            key:'mandatory_fields',
            components: [
                // TITLE
                {
                    type: 'textfield',
                    key: 'dct_title',
                    input: true,
                    //multiple:true,
                    validate: { required: true }
                },

                // DESCRIPTION
                {
                    type: 'textarea', /**/
                    defaultValue: '',
                    key: 'dct_description',
                    input: true,
                    //multiple: true,
                    validate: { required: true }
                },

                // THEME
                {
                    input: true,
                    components: [{
                        type: "select",
                        key: "dcat_theme",
                        data: {
                            custom: "values = METADATA.loadTheme('main_theme')"
                        },
                        dataSrc: "custom",
                        template: "<span>{{ item.label }}</span>",
                        multiple: false,
                        input: true,
                        validate: { required: true }
                    } ,
                        {
                            type: "select",
                            key: "dct_subject",
                            data: {
                                custom: "values = METADATA.loadTheme(data.dcat_theme.value)"
                            },
                            dataSrc: "custom",
                            template: "<span>{{ item.label }}</span>",
                            multiple: true,
                            refreshOn: 'dct_subject',
                            input: true,
                            validate: { required: true }
                        }],
                    tableView: true,
                    key: 'dcat_theme-dct_subject',
                    type: 'datagrid'
                },

                // ACCRUAL PERIODICITY
                {
                    type: 'select',
                    key: 'dct_accrualPeriodicity',
                    template: '{{ item.label }}',
                    multiple: false,
                    dataSrc: "custom",
                    input: true,
                    data: {
                        custom: "values = FREQUENCY.frequency"
                    },
                    validate: { required: true },
                }

            ]
        },

        // IDENTIFIER
        {
            type: 'textfield',
            key: 'dct_identifier',
            input: true
        },

        // OTHER IDENTIFIER
        {
            input: true,
            components: [
                {
                    type: 'textfield',
                    key: 'othid_identifier',
                    input: true
                },
                {
                    type: 'textfield',
                    key: 'othid_organization_name',
                    input: true
                },
                {
                    type: 'textfield',
                    key: 'othid_organization_identifier',
                    input: true
                }],
            key: 'adms_identifier',
            type: 'datagrid'
        },

        // PUBLISHER
        {
            input: false,
            columns: [
                {
                    components: [
                        {
                            type: 'textfield',
                            key: 'dct_publisher',
                            input: true
                        }
                    ]
                },
                {
                    components: [
                        {
                            type: 'textfield',
                            key: 'dataset_ipa_iva',
                            input: true
                        }
                    ]
                }
            ],
            type: 'columns',
            key: 'columns'
        },

        // ISSUED DATE
        {
            type: 'datetime',
            key: 'dct_issued',
            datepickerMode: 'day',
            enableDate: true,
            enableTime: false,
            format: 'dd-MM-yyyy',
            input: true
        },

        // MODIFIED DATE
        /*{
            type: 'datetime',
            key: 'dct_modified',
            datepickerMode: 'day',
            enableDate: true,
            enableTime: false,
            format: 'dd-MM-yyyy',
            input: true
        },*/

        // SPATIAL
        {
            type: "select",
            key: "dct_spatial",
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
                            key: 'locn_geographicalName',
                            multiple: false,
                            defaultValue: '',
                            protected: false,
                            unique: false,
                            persistent: true,
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
                            key: 'dcatapit_geographicalIdentifier',
                            multiple: false,
                            defaultValue: '',
                            protected: false,
                            unique: false,
                            persistent: true,
                            type: 'textfield'
                        }
                    ]
                }
            ],
            type: 'columns',
            key: 'columns'
        },

        // LANGUAGE
        {
            type: "select",
            key: "dct_language",
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
                datepickerMode: 'day',
                enableDate: true,
                enableTime: false,
                format: 'dd-MM-yyyy',
                input: true
            }, {
                type: 'datetime',
                key: 'dct_period_of_time-schema_end_date',
                datepickerMode: 'day',
                enableDate: true,
                enableTime: false,
                format: 'dd-MM-yyyy',
                input: true
            }],
            tableView: true,
            key: 'dct_temporal',
            type: 'datagrid'
        },

        // RIGHTS HOLDER
        {
            type: 'textfield',
            key: 'dct_rights_holder',
            input: true
        },

        // VERSION
        {
            type: 'textfield',
            key: 'owl_versionInfo',
            input: true
        },

        // CONFORMS TO (IDENTIFICATORE - TITOLO - DESCRIZIONE - URI)
        {
            input: true,
            components: [{
                type: 'textfield',
                key: 'dct_standards-dct_identifier',
                input: true
            }, {
                type: 'textfield',
                key: 'dct_standards-dct_title',
                input: true
            },
                {
                    type: 'textfield',
                    key: 'dct_standards-dct_description',
                    input: true
                },
                {
                    type: 'textfield',
                    key: 'dct_standards-referenceDocumentation_URI',
                    input: true
                }],
            key: 'dct_conformsTo',
            type: 'datagrid'
        },

        // CONTACT POINT
        {
            type: 'textfield',
            key: 'dcat_contactPoint',
            input: true
        },

        // CREATOR
        {
            input: true,
            components: [
                {
                    type: 'textfield',
                    key: 'foaf_agent-dct_identifier',
                    input: true
                },
                {
                    type: 'textfield',
                    key: 'foaf_agent-foaf_name',
                    input: true
                }],
            key: 'foaf_agent-dct_identifier-foaf_agent-foaf_name',
            type: 'datagrid'
        },

        // KEYWORD
        {
            type: 'textfield',
            key: 'dcat_keyword',
            input: true
        },

        // LICENSE
        {
            type: 'select',
            key: 'dct_license',
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
            input: true
        },

        // AUTHOR
        {
            type: 'textfield',
            key: 'dct_creator',
            input: true
        },

        // DISTRIBUTION TITLE
        {
            type: 'textfield',
            key: 'distribution_dct_title',
            input: true
        },

        // DISTRIBUTION DESCRIPTION
        {
            type: 'textarea',
            key: 'distribution_dct_description',
            defaultValue: '',
            input: true
        },

        // DISTRIBUTION FORMAT
        {
            type: 'select',
            key: 'dct_format',
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

        // BYTE SIZE
        {
            type: 'textfield',
            key: 'dcat_byteSize',
            defaultValue: '',
            input: true
        },

        // SUBMIT
        {
            type: 'button',
            action: 'submit',
            label: 'Submit',
            theme: 'primary'
        }
    ];

    METADATA.add_info(components);

    let is_read_only = !!window.frameElement.getAttribute('data-read-only');

    Formio.createForm(document.getElementById('dcat_ap_it_form'),
        { components: components }, { readOnly: is_read_only }
    ).then(function(form)
    {
        METADATA.form = form;

        let meta = this.parent.COCREATION.metadata ? (typeof this.parent.COCREATION.metadata === 'string' ? JSON.parse(this.parent.COCREATION.metadata) : this.parent.COCREATION.metadata) : null;

        if(meta)
        {
            METADATA.form.submission = {
                data: meta
            };
        }

        METADATA.form.on('submit', (submission) => {
            this.parent.window.dispatchEvent(new CustomEvent('update-metadata', {detail: { metadata: submission.data} }));
        });

        // Everytime the form changes, this will fire.
        METADATA.form.on('change', function(changed) {
            console.log('Form was changed', changed);
        });

/*        METADATA.form.components.forEach((e,i)=>{
            let el = e.element.querySelector('input');
            if(el)
                el.setAttribute('title', dcat_ap_it_ln[METADATA.form.component.components[i].key + '-it']);
        });*/


        /*Formio.request('./datasource/themes/themes.json', "GET", null, null, null).then((data)=>{
            console.log('DATA');
            console.log(data);
            console.log('DATA');
        });*/
    });
};

METADATA.add_info = function(components)
{
    let ln = parent.ODE.user_language || 'en';

    components.forEach((e)=>
    {
        if(e.components || e.columns)
            METADATA.add_info(e.components || e.columns);

        if(e.key && dcat_ap_it_ln[e.key + '-label-' + ln])
        {
            e.label       = dcat_ap_it_ln[e.key + '-label-' + ln];
            e.placeholder = dcat_ap_it_ln[e.key + '-placeholder-' + ln];
            e.tooltip     = dcat_ap_it_ln[e.key + '-tooltip-' + ln];
        } else if(dcat_ap_it_ln[e.key + '-title-' + ln])
            e.title = dcat_ap_it_ln[e.key + '-title-' + ln];
    })

};

METADATA.init();