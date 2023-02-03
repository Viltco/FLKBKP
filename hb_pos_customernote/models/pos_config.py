# -*- coding: utf-8 -*-
# Copyright (C)  Houda BENTALEB

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_orderline_customer_notes = fields.Boolean(string='Customer Notes')
