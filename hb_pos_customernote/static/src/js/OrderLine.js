odoo.define('hb_pos_customernote.Orderline', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const Orderline = require('point_of_sale.Orderline');


     const HbOrderline = Orderline => class  extends Orderline{

        get customerNote() {
            return this.props.line.get_customer_note();
        }
    }

     Registries.Component.extend(Orderline, HbOrderline);


    return HbOrderline;
});
