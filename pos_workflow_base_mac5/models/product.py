from odoo import api, fields, models


class Product(models.Model):
    _inherit = 'product.product'

    standard_price_computed = fields.Float(compute='_get_prices_with_tax', string='Cost Price (Computed)')

    def _get_prices_with_tax(self):
        company = self.env.user.company_id
        currency = company.currency_id
        for product in self:
            standard_price = product.standard_price
            if product.uom_id != product.uom_po_id:
                standard_price = product.uom_id._compute_price(standard_price, product.uom_po_id)
            product.standard_price_computed = standard_price
