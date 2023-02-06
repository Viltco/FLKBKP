from odoo import fields, models, api, _
from odoo.exceptions import  UserError


class RevmaxConf(models.Model):
    _name = 'revmax.conf'

    name = fields.Char()
    ip_address = fields.Char('IP Address')
    port = fields.Char('Revmax Port')
    user_id = fields.Many2one('res.users')

    @api.constrains('user_id')
    def check_unique_user_id(self):
        records = self.env['revmax.conf'].search(
            [('user_id', '=', self.user_id.id)])
        if len(records) > 1:
            raise UserError(_('Configuration for this user already exists.'))

