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

METADATA.create_form = function()
{
    Formio.createForm(document.getElementById('common_core_form'), {
        components: [
            // TITOLO
            {
                type: 'textfield',
                key: 'title',
                label: 'Title',
                placeholder: 'Title',
                input: true,
                validate: {
                    required: false
                }
            },

            // DESCRIPTION
            {
                type: 'textfield',
                key: 'description',
                label: 'Description',
                placeholder: 'Description',
                input: true,
                validate: {
                    required: false
                }
            },

            // Licenza
            {
                type: "select",
                label: "License",
                key: "license",
                placeholder: "License",
                data: {
                    values: [
                        {value:"notspecified", label:"License not specified"},
                        {value:"cc-by", label:"Creative Commons Attribution"},
                        {value:"cc-by-sa", label:"Creative Commons Attribution Share-Alike"},
                        {value:"cc-zero", label:"Creative Commons CCZero"},
                        {value:"cc-nc", label:"Creative Commons Non-Commercial, (Any)"},
                        {value:"gfdl", label:"GNU Free Documentation License"},
                        {value:"odc-by", label:"Open Data Commons Attribution License"},
                        {value:"odc-odbl", label:"Open Data Commons Open Database License (ODbL)"},
                        {value:"odc-pddl", label:"Open Data Commons Public Domain Dedication and License (PDDL)"},
                        {value:"other-at", label:"Other (Attribution)"},
                        {value:"other-nc", label:"Other (Non-Commercial)"},
                        {value:"other-closed", label:"Other (Not Open)"},
                        {value:"other-open", label:"Other (Open)"},
                        {value:"other-pd", label:"Other (Public Domain)"},
                        {value:"uk-ogl", label:"UK Open Government Licence (OGL)"}
                    ]
                },
                validate: {
                    required: false
                },
                dataSrc: "values",
                template: "<span>{{ item.label }}</span>",
                multiple: false,
                input: true
            },


            // Lingua
            {
                type: "select",
                label: "Language",
                key: "language",
                placeholder: "Language",
                data: {
                    values: [
                        {value:"it", label:"Italiano"},
                        {value:"en", label:"English"},
                        {value:"es", label:"Español"},
                        {value:"fr", label:"Français"},
                        {value:"de", label:"Deutsch"},
                        {value:"pl", label:"Polski"},
                        {value:"nl", label:"Nederlan"}
                    ]
                },
                validate: {
                    required: false
                },
                dataSrc: "values",
                template: "<span>{{ item.label }}</span>",
                multiple: false,
                input: true
            },

            // VERSIONE
            {
                type: 'textfield',
                key: 'version',
                label: 'Version',
                placeholder: 'Version',
                input: true,
                validate: {
                    required: false
                }
            },

            // CONTACT NAME
            {
                type: 'textfield',
                key: 'contact_name',
                label: 'Contact Name',
                placeholder: 'Contact Name',
                input: true,
                validate: {
                    required: false
                }
            },

            // CONTACT E-MAIL
            {
                type: 'textfield',
                key: 'contact_email',
                label: 'Contact e-mail',
                placeholder: 'Contact e-mail',
                input: true,
                validate: {
                    required: false
                }
            },

            // Maintainer
            {
                type: 'textfield',
                key: 'maintainer',
                label: 'Maintainer',
                placeholder: 'Maintainer',
                input: true,
                validate: {
                    required: false
                }
            },

            // Maintainer e-mail
            {
                type: 'textfield',
                key: 'maintainer_email',
                label: 'Maintainer e-mail',
                placeholder: 'Maintainer e-mail',
                input: true,
                validate: {
                    required: false
                }
            },

            // Origin
            {
                type: 'textfield',
                key: 'origin',
                label: 'Origin',
                placeholder: 'Origin',
                input: true,
                validate: {
                    required: false
                }
            },

            // "Common Core" Required Fields
            {
                input:false,
                theme:'primary',
                type: 'panel',
                title: '"Common Core" Required Fields',
                components: [
                    {
                        type: 'textfield',
                        key: 'tags',
                        label: 'Tags',
                        placeholder: 'Tags',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'last_update',
                        label: 'Last Update',
                        placeholder: 'Last Update',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'publisher',
                        label: 'Publisher',
                        placeholder: 'Publisher',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'unique_identifier',
                        label: 'Unique Identifier',
                        placeholder: 'Unique Identifier',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'public_access_level',
                        label: 'Public Access Level',
                        placeholder: 'Public Access Level',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                ]
            },

            // "Common Core" Required if Applicable Fields
            {
                input: false,
                theme: 'primary',
                type: 'panel',
                title: '"Common Core" Required if Applicable Fields',
                components: [
                    {
                        type: 'textfield',
                        key: 'bureau_code',
                        label: 'Bureau Code',
                        placeholder: 'Bureau Code',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'program_code',
                        label: 'Program Code',
                        placeholder: 'Program Code',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'access_level_comment',
                        label: 'Access Level Comment',
                        placeholder: 'Access Level Comment',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'download_url',
                        label: 'Download URL',
                        placeholder: 'Download URL',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'endpoint',
                        label: 'Endpoint',
                        placeholder: 'Endpoint',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'format',
                        label: 'Format',
                        placeholder: 'Format',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'spatial',
                        label: 'Spatial',
                        placeholder: 'Spatial',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'temporal',
                        label: 'Temporal',
                        placeholder: 'Temporal',
                        input: true,
                        validate: {
                            required: false
                        }
                    }
                ]
            },

            // Expanded Fields
            {
                input: false,
                theme: 'primary',
                type: 'panel',
                title: 'Expanded Fields',
                components: [
                    {
                        type: 'textfield',
                        key: 'category',
                        label: 'Category',
                        placeholder: 'Category',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'data_dictionary',
                        label: 'Data Dictionary',
                        placeholder: 'Data Dictionary',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'data_quality',
                        label: 'Data Quality',
                        placeholder: 'Data Quality',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'distribution',
                        label: 'Distribution',
                        placeholder: 'Distribution',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'frequency',
                        label: 'Frequency',
                        placeholder: 'Frequency',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'homepage_url',
                        label: 'Homepage URL',
                        placeholder: 'Homepage URL',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'primary_it_investment_uii',
                        label: 'Primary IT investment UII',
                        placeholder: 'Primary IT investment UII',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'related_documents',
                        label: 'Related Documents',
                        placeholder: 'Related Documents',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'release_date',
                        label: 'Release Date',
                        placeholder: 'Release Date',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                    {
                        type: 'textfield',
                        key: 'system_of_records',
                        label: 'System of Records',
                        placeholder: 'System of Records',
                        input: true,
                        validate: {
                            required: false
                        }
                    },
                ]
            },

            {
                type: 'button',
                action: 'submit',
                label: 'Submit',
                theme: 'primary'
            },

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