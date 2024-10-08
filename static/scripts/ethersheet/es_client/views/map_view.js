if (typeof define !== 'function') { var define = require('amdefine')(module) }

define( function(require,exports,module){
   var t           = require('../templates');
   var RefBinder   = require('ref-binder');
   var View        = require('backbone').View;
   var self;

   var MapView = module.exports = View.extend({

       satLayer:  new ol.layer.Tile({
           title: 'Global Imagery',
           visible: true,
           source: new ol.source.BingMaps({
               key: "AiAjdlCagGtE5269Z4YP3e3VtMkzzAKvowq5cQadahNZjVxttUxdDS40u91Uv8qP",
               imagerySet: 'AerialWithLabels'})
       }),

       layers:  [],
       vectorSource: null,
       coords:[],
       geojson: "",
       map: null,

       events: {
       },

       initialize: function (o) {
           this.models = new RefBinder(this);
           this.cell = o.cell;
           this.table = o.table;
           this.coords = o.coords;
           this.geojson = o.geojson;
           self = this;

           this.olview = new ol.View({
               center: [0, 0],
               projection: "EPSG:4326",
               zoom: 3,
               minZoom: 2,
               maxZoom: 20
           });

           this.baseLayer = new ol.layer.Tile({
               source: new ol.source.OSM()
           });

           //marker layer
           this.iconStyle = new ol.style.Style({
               image: new ol.style.Icon(({
                   anchor: [0.5, 46],
                   anchorXUnits: 'fraction',
                   anchorYUnits: 'pixels',
                   opacity: 0.9,
                   //src: 'http://services.routetopa.eu/DEEalerProvider/COMPONENTS/datalets/leafletjs-datalet/leafletsjs/images/marker-icon.png',//'icons/marker-icon.png'
                   src: '/es_client/icons/marker-icon.png',//'icons/marker-icon.png'
               }))
           });

           this.vectorSource = new ol.source.Vector({});

           //draw layer
           this.source = new ol.source.Vector({wrapX: false});

           this.draw_layer = new ol.layer.Vector({
               source: this.source,
               style: new ol.style.Style({
                   fill: new ol.style.Fill({
                       color: 'rgba(255, 255, 255, 1.0)'
                   }),
                   stroke: new ol.style.Stroke({
                       color: '#ffff00',
                       width: 4
                   }),
                   image: new ol.style.Circle({
                       radius: 7,
                       fill: new ol.style.Fill({
                           color: '#ffff00'
                       })
                   })
               })
           });
       },

       render: function (template) {
           this.$el.html((_.isUndefined(template)) ? t.map_view({}) : template);

           this.map = new ol.Map({
               target:'map',
               view: this.olview,
               controls: ol.control.defaults({
                   attributionOptions:({
                       collapsible: false
                   })}),
               loadTilesWhileAnimating: true,
               loadTilesWhileInteracting: true,
               layers: [
                   this.baseLayer,
                   this.satLayer,
                   new ol.layer.Vector({
                       source: this.vectorSource
                   }),
                   this.draw_layer
               ]
           });

           if(!_.isUndefined(this.coords)) {
               this.setMarker(this.coords);
               this.olview.setCenter(this.coords);
               this.olview.setZoom(16);
           }

           if(!_.isUndefined(this.geojson)){
               var vectorSource = new ol.source.Vector({
                   features: (new ol.format.GeoJSON()).readFeatures(this.geojson)
               });

               var geojsonLayer = new ol.layer.Vector({
                   source: vectorSource
               });

               this.map.getLayers().push(geojsonLayer);
               this.map.getView().fit(vectorSource.getExtent(), this.map.getSize());

           }
       },

       setMarker: function(coords){
           var iconFeature = new ol.Feature({
               geometry: new ol.geom.Point(coords),
               name: ''
           });

           iconFeature.setStyle(this.iconStyle);

           this.vectorSource.clear(true);
           this.vectorSource.addFeature( iconFeature );

           //this.coordinate =  ol.proj.transform([coordinate[1],coordinate[0]], "EPSG:900913", "EPSG:4326");
           this.coords = [coords[0],coords[1]];
       }

   })
});



