from odoo import fields, models


class pos_config(models.Model):
    _inherit = 'pos.config'

    pos_import = fields.Selection(selection=[], string='POS Import')
    pos_workflow = fields.Selection(selection=[('pos.order', 'Create POS Order')],
                                    string='POS Workflow', required=True, default='pos.order')
    use_pos_product_tax = fields.Boolean('Use POS Product Tax',
                                         help=('Use POS product taxes field instead'
                                               ' of the default product taxes'))
