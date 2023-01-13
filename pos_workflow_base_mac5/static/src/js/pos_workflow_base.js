odoo.define('pos_workflow_base.pos_workflow_base', function (require) {
"use strict";

const { useListener } = require('web.custom_hooks');
const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
const ClientDetailsEdit = require('point_of_sale.ClientDetailsEdit');
const ClientListScreen = require('point_of_sale.ClientListScreen');
const DB = require('point_of_sale.DB');
const models = require('point_of_sale.models');
const ProductScreen = require('point_of_sale.ProductScreen');
const Registries = require('point_of_sale.Registries');


var _super_posmodel = models.PosModel.prototype;
var product_index = _super_posmodel.models.map(function(e) { return e.model; }).indexOf('product.product');
_super_posmodel.models.splice(product_index, 1)

models.load_models({
    model:  'product.product',
    fields: ['display_name', 'lst_price', 'standard_price', 'categ_id', 'pos_categ_id', 'taxes_id',
             'barcode', 'default_code', 'to_weight', 'uom_id', 'description_sale', 'description',
             'product_tmpl_id','tracking', 'write_date', 'available_in_pos', 'attribute_line_ids', 'active',
             // ADDED
             // ***********************************************************************************
             'supplier_taxes_id', 'purchase_ok', 'sale_ok', 'uom_po_id', 'standard_price_computed',
             'pos_customer_tax_ids', 'pos_supplier_tax_ids'
             // ***********************************************************************************
             ],
    order:  _.map(['sequence','default_code','name'], function (name) { return {name: name}; }),
    domain: function(self){
        var domain = ['&', '&', ['sale_ok','=',true],['available_in_pos','=',true],'|',['company_id','=',self.config.company_id[0]],['company_id','=',false]];

        // ADDED
        // *****************************************************************************************************
        var workflow = self.config.pos_workflow;
        if( workflow.indexOf('purchase') >= 0 || workflow.indexOf('supplier') >= 0 ){
            var domain = ['&', '&', ['purchase_ok', '=', true], ['available_in_pos', '=', true],
                               '|', ['company_id', '=', self.config.company_id[0]], ['company_id', '=', false]];
        }
        // *****************************************************************************************************

        if (self.config.limit_categories &&  self.config.iface_available_categ_ids.length) {
            domain.unshift('&');
            domain.push(['pos_categ_id', 'in', self.config.iface_available_categ_ids]);
        }
        if (self.config.iface_tipproduct){
          domain.unshift(['id', '=', self.config.tip_product_id[0]]);
          domain.unshift('|');
        }
        return domain;
    },
    context: function(self){ return { display_default_code: false }; },
    loaded: function(self, products){
        var using_company_currency = self.config.currency_id[0] === self.company.currency_id[0];
        var conversion_rate = self.currency.rate / self.company_currency.rate;

        // ADDED
        // **************************
        self.db.config = self.config;
        // **************************

        self.db.add_products(_.map(products, function (product) {
            if (!using_company_currency) {
                product.lst_price = round_pr(product.lst_price * conversion_rate, self.currency.rounding);
            }
            product.categ = _.findWhere(self.product_categories, {'id': product.categ_id[0]});
            product.pos = self;
            return new models.Product({}, product);
        }));
    },
}, {'after': 'pos.category'})


models.load_fields('res.partner', ['debit', 'credit'])


models.PosModel = models.PosModel.extend({
    get_importobject: function() {
        var order = this.get_order();
        if (order) {
            return order.get_importobject();
        }
        return null;
    },
});


var _super_order = models.Order.prototype;
models.Order = models.Order.extend({
    initialize: function(attr, options) {
        var result = _super_order.initialize.apply(this, arguments);
        this.pos_workflow = this.pos.config.pos_workflow;
        this.pos_import = this.pos.config.pos_import;

        this.wkf_date = false;
        this.wkf_note = false;
        this.wkf_partner_ref = false;
        this.wkf_ref = false;
        return result;
    },

    get_importobject: function(){
        return null;
    },

    get_importobject_name: function(){
        return "";
    },

    export_for_printing: function(){
        var result = _super_order.export_for_printing.apply(this, arguments);
        result.wkf_date = this.wkf_date
        result.wkf_note = this.wkf_note
        result.wkf_partner_ref = this.wkf_partner_ref
        result.wkf_ref = this.wkf_ref
        return result;
    },
});


DB.include({
    init: function( options ){
        this._super(options);
        this.config = false;
    },

    add_products: function( products ){
        if(!products instanceof Array){
            products = [products];
        }

        var target_products = [];
        var workflow = this.config ? this.config.pos_workflow : '';

        for(var i = 0, len = products.length; i < len; i++){
            var product = products[i];
            if( (workflow.indexOf('purchase') >= 0 || workflow.indexOf('supplier') >= 0)
                    && product.purchase_ok ){
                product.lst_price = product.standard_price_computed;
                if (this.config && this.config.use_pos_product_tax
                        && product.pos_supplier_tax_ids !== undefined
                        && product.pos_supplier_tax_ids.length !== 0) {
                    product.taxes_id = product.pos_supplier_tax_ids;
                } else {
                    product.taxes_id = product.supplier_taxes_id;
                }
                product.uom_id = product.uom_po_id
                target_products.push(product);
            } else if( (workflow.indexOf('purchase') < 0 && workflow.indexOf('supplier') < 0)
                    && product.sale_ok ){
                if (this.config && this.config.use_pos_product_tax
                        && product.pos_customer_tax_ids !== undefined
                        && product.pos_customer_tax_ids.length !== 0) {
                    product.taxes_id = product.pos_customer_tax_ids;
                }
                target_products.push(product);
            }
        }

        this._super(target_products);
    },
});


class POSWorkflowPopup extends AbstractAwaitablePopup {
    constructor() {
        super(...arguments);
        this.order = this.env.pos.get('selectedOrder');
        this.workflow = this.order.pos_workflow;
    }

    getPayload() {
        return this.state;
    }
}
POSWorkflowPopup.template = 'POSWorkflowPopup';
POSWorkflowPopup.defaultProps = {
    title: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
};


const WorkflowBaseClientDetailsEdit = (ClientDetailsEdit) =>
    class extends ClientDetailsEdit {
        saveChanges() {
            var workflow = this.env.pos.config.pos_workflow;
            if( workflow.indexOf('purchase') >= 0 || workflow.indexOf('supplier') >= 0 ){
                let processedChanges = {};
                for (let [key, value] of Object.entries(this.changes)) {
                    if (this.intFields.includes(key)) {
                        processedChanges[key] = parseInt(value) || false;
                    } else {
                        processedChanges[key] = value;
                    }
                }
                if ((!this.props.partner.name && !processedChanges.name) ||
                    processedChanges.name === '' ){
                    return this.showPopup('ErrorPopup', {
                      title: this.env._t('A Vendor Name Is Required'),
                    });
                }
            }
            super.saveChanges();
        }
    };


const WorkflowBaseClientListScreen = (ClientListScreen) =>
    class extends ClientListScreen {
        get nextButton() {
            var partner = 'Customer'
            var workflow = this.env.pos.config.pos_workflow;
            if( workflow.indexOf('purchase') >= 0 || workflow.indexOf('supplier') >= 0 ){
                partner = 'Vendor';
            }

            if (!this.props.client) {
                return { command: 'set', text: this.env._t('Set ' + partner) };
            } else if (this.props.client && this.props.client === this.state.selectedClient) {
                return { command: 'deselect', text: this.env._t('Deselect ' + partner) };
            } else {
                return { command: 'set', text: this.env._t('Change ' + partner) };
            }
        }
    };


const WorkflowBaseProductScreen = (ProductScreen) =>
    class extends ProductScreen {
        constructor() {
            super(...arguments);
            this.order = this.env.pos.get_order();
            this.workflow = this.order.pos_workflow;
            useListener('click-pos-workflow', this._onClickPosWorkflow);
        }

        async _onClickPosWorkflow() {
            if (this.order) {
                if (!this.order.get_client()) {
                    if( this.workflow.indexOf('purchase') >= 0 || this.workflow.indexOf('supplier') >= 0 ){
                        this.showPopup('ErrorPopup', {
                            title: this.env._t('No Vendor'),
                            body: this.env._t('Please select a vendor first'),
                        });
                        return 'error';
                    } else {
                        this.showPopup('ErrorPopup', {
                            title: this.env._t('No Customer'),
                            body: this.env._t('Please select a customer first'),
                        });
                        return 'error';
                    }
                }
                if (this.order.orderlines.length == 0) {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('No Order Lines'),
                        body: this.env._t('Please add products first'),
                    });
                    return 'error';
                }
            }
        }
    };


Registries.Component.add(POSWorkflowPopup);
Registries.Component.extend(ClientDetailsEdit, WorkflowBaseClientDetailsEdit);
Registries.Component.extend(ClientListScreen, WorkflowBaseClientListScreen);
Registries.Component.extend(ProductScreen, WorkflowBaseProductScreen);

return {
    POSWorkflowPopup: POSWorkflowPopup,
};

})
