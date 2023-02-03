odoo.define('hb_pos_customernote.models', function (require) {
"use strict";

var models = require('point_of_sale.models');
var _super_orderline = models.Orderline.prototype;

models.Orderline =  models.Orderline.extend({

    initialize: function(attr, options) {
        _super_orderline.initialize.call(this,attr,options);
        this.customerNote = this.customerNote || '';

    },

    init_from_JSON: function(json) {
        _super_orderline.init_from_JSON.call(this,json);
        this.set_customer_note(json.customer_note);

    },
    clone: function(){
       var orderline = _super_orderline.clone.call(this);

        orderline.customerNote = this.customerNote;
        return orderline;
    },
    can_be_merged_with: function(orderline){

     if (orderline.get_customer_note() !== this.get_customer_note()) {
            return false;
        }
        else {
            return _super_orderline.can_be_merged_with.apply(this,arguments);
        }


    },

    export_as_JSON: function() {
    var json = _super_orderline.export_as_JSON.call(this);
        json.customer_note =  this.get_customer_note();
        return json;
    },
    export_for_printing: function(){
    var result = _super_orderline.export_for_printing.call(this);
      result.customer_note= this.get_customer_note();
      return result;


    },



    set_customer_note: function(note) {
        this.customerNote = note;
    },
    get_customer_note: function() {
        return this.customerNote;
    },

});

});