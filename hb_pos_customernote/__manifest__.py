# -*- coding: utf-8 -*-
# Copyright (C)  Houda BENTALEB

{
    'name': 'Pos Customer Note',

    'author': 'Houda BENTALEB',

    'version': '14.0.1.0.0',

    'category': 'Sales/Point of Sale',

    'summary': 'This module allows the user to create a Customer Note on order lines, from POS Interface,'
               ' to be shown on receipt and invoice.',

    'description': """
   This module allows the user to create a Customer Note on order lines, from POS Interface, to be shown on receipt and invoice.
       """,

    'license': 'AGPL-3',

    'support': 'houda.bentaleb@gmail.com',

    'depends': [
        'point_of_sale',
    ],

    'data': [
        'views/pos_config_views.xml',
        'views/pos_order_view.xml',
        'views/asset_pos_common.xml',
    ],

    'qweb': [
        'static/src/xml/OrderLineCustomerNoteButton.xml',
        'static/src/xml/OrderlineDetails.xml',
        'static/src/xml/orderline.xml',
        'static/src/xml/OrderReceipt.xml',

    ],
    "images": ["static/description/background.png"],

    'installable': True,

    'auto_install': False,

    'application': True,

}
