odoo.define('hb_pos_customernote.OrderlineDetails', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const { format } = require('web.field_utils');
    const { round_precision: round_pr } = require('web.utils');
    const OrderlineDetails = require('point_of_sale.OrderlineDetails');


     const HbOrderlineDetails = OrderlineDetails => class  extends OrderlineDetails{
         constructor() {
            super(...arguments);
        }

        get customerNote() {
            return this.props.line.get_customer_note();
        }

    }

    Registries.Component.extend(OrderlineDetails, HbOrderlineDetails);


    return HbOrderlineDetails;
});
