{
    'name': 'POS Workflow Base',
    'version': '14.0.1.3',
    'summary': """POS Workflow Base""",
    'description': """
POS Workflow Base
=================

Base module for POS workflows, returns and import
""",
    'category': 'Hidden',
    'author': 'MAC5',
    'contributors': ['MAC5'],
    'website': 'https://apps.odoo.com/apps/modules/browse?author=MAC5',
    'depends': [
        'point_of_sale',
        'sale',
    ],
    'data': [
        'views/pos_config_views.xml',
        'views/pos_templates.xml',
    ],
    'qweb': ['static/src/xml/pos_workflow_base.xml'],
    'installable': True,
    'application': False,
    'auto_install': False,
}
