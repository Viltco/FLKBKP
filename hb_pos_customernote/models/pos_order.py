# -*- coding: utf-8 -*-
# Copyright (C)  Houda BENTALEB

import logging

from odoo import fields, models, _
from odoo.tools import float_repr

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _prepare_invoice_lines(self):
        invoice_lines = []
        for line in self.lines:
            invoice_lines.append((0, None, self._prepare_invoice_line(line)))
            if line.order_id.pricelist_id.discount_policy == 'without_discount' and line.price_unit != line.product_id.lst_price:
                invoice_lines.append((0, None, {
                    'name': _('Price discount from %s -> %s',
                              float_repr(line.product_id.lst_price, self.currency_id.decimal_places),
                              float_repr(line.price_unit, self.currency_id.decimal_places)),
                    'display_type': 'line_note',
                }))
            if line.customer_note:
                invoice_lines.append((0, None, {
                    'name': line.customer_note,
                    'display_type': 'line_note',
                }))

        return invoice_lines

    def _prepare_invoice_vals(self):
        res = super(PosOrder, self)._prepare_invoice_vals()
        res['invoice_line_ids'] = self._prepare_invoice_lines()
        return res


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    customer_note = fields.Char('Customer Note', help='This is a note destined to the customer')

    def _export_for_ui(self, orderline):
        res = super(PosOrderLine, self)._export_for_ui(orderline)

        res['customer_note'] = orderline.customer_note

        return res
