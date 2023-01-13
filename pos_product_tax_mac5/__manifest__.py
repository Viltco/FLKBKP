{
    'name': 'POS Product Taxes',
    'version': '14.0.1.2.1',
    'summary': """New Product Taxes Specific for POS""",
    'description': """
POS Product Taxes
=================

Module to create new taxes in product specifically for POS transaction only


Keywords: Odoo POS Product Taxes, Odoo Product Taxes, Odoo POS Customer Taxes, Odoo Customer Taxes,
Odoo POS Supplier Taxes, Odoo Supplier Tax, Odoo POS Vendor Taxes, Odoo Vendor Taxes
""",
    'category': 'Point of Sale',
    'author': 'MAC5',
    'contributors': ['MAC5'],
    'website': 'https://apps.odoo.com/apps/modules/browse?author=MAC5',
    'depends': [
        'pos_workflow_base_mac5',
    ],
    'data': [
        'views/pos_config_views.xml',
        'views/product_template_views.xml',
    ],
    'demo': [],
    'qweb': ['static/src/xml/pos_product_tax.xml'],
    'installable': True,
    'application': False,
    'auto_install': False,
    'images': ['static/description/banner.gif'],
    'price': 59.99,
    'currency': 'EUR',
    'support': 'mac5_odoo@outlook.com',
    'license': 'OPL-1',
    'live_test_url': 'https://youtu.be/7YuK-B051rM',
}
