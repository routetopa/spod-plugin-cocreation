FORM = {
    formio:null,
    template:{}
};

FORM.init = function()
{
    FORM.create_form();
};

FORM.handle_options = function()
{
    document.querySelectorAll(".accordion").forEach((e)=>{e.style.display = 'none'});

    document.querySelectorAll("button.show-options").forEach((el)=>{
        let is_opened = false;
        el.addEventListener('click', (evt)=>{
            evt.target.closest(".card-body.panel-body").querySelectorAll(".accordion").forEach( (e)=>{
                is_opened ? e.style.display = 'none' : e.style.display = 'block';
            });
            is_opened = !is_opened;
        });
    });
};

FORM.create_form = function()
{
    parent.$.getJSON(parent.ODE.ajax_coocreation_room_get_array_sheetdata).then((data)=>
    {
        let submission = JSON.parse(parent.COCREATION.form);

        let components = [];
        let index = 0;

        for(let key in data[0])
        {
            if(data[0].hasOwnProperty(key))
            {
                let t = parent.$.extend(true, {}, FORM.template.blue_print);

                t.title = key;
                
                for(let j=0; j<t.components.length; j++) {
                    for (let i = 0; i < t.components[j].columns.length; i++)
                        t.components[j].columns[i].components[0].key = index + '_' + t.components[j].columns[i].components[0].key;
                }

                t.components[t.components.length-1].key = index + '_' + t.components[t.components.length-1].key;

                FORM.enrich_element(t.components[t.components.length-1], submission[index + '_element-type'], index);

                components.push(t);
                index++;
            }
        }

        // ADD BUTTON
        components.push({type: 'button', action: 'submit', label: 'Submit', theme: 'primary'});

        FORM.render_form(components);
    })
};

FORM.render_form = function (components)
{
    Formio.createForm(document.getElementById('form'), {components: components}).then(function(form)
    {
        FORM.formio = form;

        let f = parent.COCREATION.form ? JSON.parse(parent.COCREATION.form) : null;

        if(f) FORM.formio.submission = { data: f };

        FORM.handle_options();

        FORM.on_formio_submit();

        FORM.on_formio_change();
    });
};

FORM.on_formio_change = function ()
{
    FORM.formio.on('change', function(e)
    {
        if(e.changed && e.changed.component.type === 'select')
        {
            let index = e.changed.component.key.split('_');
            let el = FormioUtils.getComponent(FORM.formio.component.components, index[0] + '_type_options',true);

            FORM.enrich_element(el, e.data[e.changed.component.key], index[0]);

            FORM.formio.render();
        }
    });

};

FORM.enrich_element = function (el, key, index)
{
    if(key === 'number')
    {
        let n_o = parent.$.extend(true, {}, FORM.template.number_options);
        n_o[0].components[0].key = index + '_' + n_o[0].components[0].key;
        n_o[1].components[0].key = index + '_' + n_o[1].components[0].key;
        el.columns = n_o;
    }

    if(key === 'select')
    {
        let s_o = parent.$.extend(true, {}, FORM.template.select_options);
        s_o[0].components[0].key = index + '_' + s_o[0].components[0].key;
        el.columns = s_o;
    }

    if(key === 'string')
        el.columns = [];

};

FORM.on_formio_submit = function ()
{
    FORM.formio.on('submit', (submission) => {
        let items = FORM.parse_submission(submission.data);
        parent.$.post(parent.ODE.ajax_coocreation_room_save_form, { roomId: parent.COCREATION.roomId, form_template: JSON.stringify(submission.data), form: JSON.stringify(items) });
        return true;
    });
};

FORM.parse_submission = function(submission)
{
   let items = {};

   for(let key in submission)
   {
       if(submission.hasOwnProperty(key))
       {
           let k = key.split('_');

           if (!items[k[0]])
           {
               items[k[0]] = {key: k[0]};
               parent.$.extend(true, items[k[0]], FORM.template[submission[k[0] + '_element-type']]);
           }

           items[k[0]][k[1]] = submission[key];
       }
   }

   return Object.keys(items).reduce((form, elem)=>{
       if(items[elem].required) items[elem].validate = {required:true};
       if(items[elem].min) items[elem].validate.min = items[elem].min;
       if(items[elem].max) items[elem].validate.max = items[elem].max;

       if(items[elem].type === 'select' && items[elem].selectValue)
           if(Array.isArray(items[elem].selectValue))
               items[elem].selectValue.forEach((e)=>{items[elem].data.values.push({label:e, value:e})});

       if(items[elem].visible) form.push(items[elem]);
       return form;
   },[]);

};

FORM.on_type_select_change = function()
{
    console.log('CHANGED');
};

FORM.init();

// BLUE PRINT

FORM.template.blue_print = {
    title: '',
    theme:'primary',
    type: 'panel',
    components:
        [
            {
                type: 'columns',
                input: false,
                columns:
                    [
                        {
                            width: 5,
                            components : [
                                // LABEL
                                {
                                    key: 'label',
                                    label: 'Label',
                                    type: 'textfield',
                                    input: true,
                                },
                            ]
                        },
                        {
                            width: 5,
                            components : [
                                // TYPE
                                {
                                    key: 'element-type',
                                    type: 'select',
                                    label: 'Type',
                                    template: '{{ item.label }}',
                                    multiple: false,
                                    dataSrc: 'values',
                                    input: true,
                                    data: {
                                        values: [
                                            {
                                                label: 'String',
                                                value: 'string',
                                            },
                                            {
                                                label: 'Number',
                                                value: 'number'
                                            },
                                            {
                                                label: 'Date',
                                                value: 'date_picker'
                                            },
                                            {
                                                label: 'Select',
                                                value: 'select'
                                            }
                                        ]
                                    },
                                    defaultValue : "string",
                                }
                            ]
                        },
                        {
                            width: 1,
                            components : [
                                // VISIBLE
                                {
                                    key: 'visible',
                                    label: 'Visible',
                                    inputType: "checkbox",
                                    type: 'checkbox',
                                    labelPosition: 'top',
                                    input: true,
                                    defaultValue: true
                                },
                            ]
                        },
                        {
                            width: 1,
                            components : [
                                // SHOW OPTIONS
                                {
                                    type: 'button',
                                    theme: 'primary glyphicon glyphicon-plus',
                                    customClass: "show-options",
                                    key: 'show_options'
                                }
                            ]
                        }
                    ]
            },
            // OPTIONS
            {
                type: 'columns',
                input: false,
                customClass: "accordion",
                columns:
                    [
                        {
                            width: 3,
                            components : [
                                // Placeholder
                                {
                                    key: 'placeholder',
                                    label: 'Placeholder',
                                    type: 'textfield',
                                    input: true,
                                },
                            ]
                        },
                        {
                            width: 3,
                            components : [
                                // Tooltip
                                {
                                    key: 'tooltip',
                                    label: 'Tooltip',
                                    type: 'textfield',
                                    input: true,
                                },
                            ]
                        },
                        {
                            width: 3,
                            components : [
                                // Default Value
                                {
                                    key: 'defaultValue',
                                    label: 'Default',
                                    type: 'textfield',
                                    input: true,
                                },
                            ]
                        },
                        {
                            width: 2,
                            components : [
                                // Description
                                {
                                    key: 'description',
                                    label: 'Description',
                                    type: 'textfield',
                                    input: true,
                                }
                            ]
                        },
                        {
                            width: 1,
                            components : [
                                // VISIBLE
                                {
                                    key: 'required',
                                    label: 'Required',
                                    inputType: "checkbox",
                                    type: 'checkbox',
                                    labelPosition: 'top',
                                    input: true,
                                    defaultValue: true
                                },
                            ]
                        }
                    ]
            },
            // TYPE OPTION
            {
                type: 'columns',
                input: false,
                customClass: "accordion",
                columns: [],
                key: 'type_options'
            }
        ]
};

// ELEMENT TEMPLATE

FORM.template.date_picker = {
    type: 'datetime',
    input: true,
    format: 'yyyy-MM-dd hh:mm a',
    enableDate: true,
    enableTime: true,
    defaultDate: '',
    datepickerMode: 'day',
    datePicker: {
        showWeeks: true,
        startingDay: 0,
        initDate: '',
        minMode: 'day',
        maxMode: 'year',
        yearRows: 4,
        yearColumns: 5,
        datepickerMode: 'day'
    },
    timePicker: {
        hourStep: 1,
        minuteStep: 1,
        showMeridian: true,
        readonlyInput: false,
        mousewheel: true,
        arrowkeys: true
    }
};

FORM.template.string = {
    type: 'textfield',
    input: true
};

FORM.template.number = {
    type: 'number',
    input: true,
    "validate": {}
};

FORM.template.select = {
    "type": "select",
    "template": '{{ item.label }}',
    "input": true,
    "dataSrc": 'values',
    "data": {
        "values": []
    },
    "valueProperty": "value"
};

FORM.template.number_options = [
    {
        width: 3,
        components : [
            // Min
            {
                key: 'min',
                label: 'Minimo',
                type: 'number',
                input: true,
            },
        ]
    },
    {
        width: 3,
        components : [
            // Max
            {
                key: 'max',
                label: 'Massimo',
                type: 'number',
                input: true,
            },
        ]
    }
];

FORM.template.select_options = [
    {
        width: 3,
        components : [
            // Value
            {
                key: 'selectValue',
                label: 'Valori',
                type: 'textfield',
                input: true,
                multiple: true,
            },
        ]
    }
];