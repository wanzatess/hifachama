# Generated by Django 5.1.6 on 2025-05-02 07:50

import HIFACHAMA.models.transactions
import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HIFACHAMA', '0023_customuser_chama'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transaction',
            name='chama',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='created_by',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='member',
        ),
        migrations.RemoveField(
            model_name='withdrawal',
            name='transaction',
        ),
        migrations.RemoveField(
            model_name='contribution',
            name='transaction',
        ),
        migrations.AlterModelOptions(
            name='chama',
            options={},
        ),
        migrations.AlterModelOptions(
            name='chamamember',
            options={},
        ),
        migrations.AlterModelOptions(
            name='customuser',
            options={},
        ),
        migrations.AlterModelOptions(
            name='loan',
            options={},
        ),
        migrations.AlterModelOptions(
            name='meeting',
            options={},
        ),
        migrations.AlterModelOptions(
            name='notification',
            options={},
        ),
        migrations.AlterModelManagers(
            name='customuser',
            managers=[
            ],
        ),
        migrations.RemoveIndex(
            model_name='loan',
            name='HIFACHAMA_l_status_132541_idx',
        ),
        migrations.RemoveIndex(
            model_name='notification',
            name='HIFACHAMA_n_is_read_f54930_idx',
        ),
        migrations.RemoveIndex(
            model_name='otp',
            name='HIFACHAMA_o_created_6e61de_idx',
        ),
        migrations.RenameField(
            model_name='chamamember',
            old_name='joined_at',
            new_name='join_date',
        ),
        migrations.RenameField(
            model_name='otp',
            old_name='is_used',
            new_name='used',
        ),
        migrations.AlterUniqueTogether(
            name='chamamember',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='chama',
            name='admin',
        ),
        migrations.RemoveField(
            model_name='chama',
            name='chama_type',
        ),
        migrations.RemoveField(
            model_name='chama',
            name='current_balance',
        ),
        migrations.RemoveField(
            model_name='chama',
            name='is_active',
        ),
        migrations.RemoveField(
            model_name='chama',
            name='meeting_day',
        ),
        migrations.RemoveField(
            model_name='chama',
            name='members',
        ),
        migrations.RemoveField(
            model_name='chama',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='chama',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='last_name',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='phone_number',
        ),
        migrations.RemoveField(
            model_name='loan',
            name='chama',
        ),
        migrations.RemoveField(
            model_name='loan',
            name='date_approved',
        ),
        migrations.RemoveField(
            model_name='loan',
            name='date_due',
        ),
        migrations.RemoveField(
            model_name='loan',
            name='date_repaid',
        ),
        migrations.RemoveField(
            model_name='loan',
            name='purpose',
        ),
        migrations.RemoveField(
            model_name='meeting',
            name='agenda',
        ),
        migrations.RemoveField(
            model_name='meeting',
            name='is_completed',
        ),
        migrations.RemoveField(
            model_name='meeting',
            name='minutes',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='related_chama',
        ),
        migrations.RemoveField(
            model_name='paymentdetails',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='paymentdetails',
            name='created_by',
        ),
        migrations.RemoveField(
            model_name='withdrawal',
            name='approval_status',
        ),
        migrations.AddField(
            model_name='chama',
            name='type',
            field=models.CharField(choices=[('investment', 'Investment'), ('merry_go_round', 'Merry-Go-Round'), ('hybrid', 'Hybrid')], default='hybrid', max_length=50),
        ),
        migrations.AddField(
            model_name='contribution',
            name='amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='contribution',
            name='date',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='contribution',
            name='member',
            field=models.ForeignKey(default=HIFACHAMA.models.transactions.get_default_member, on_delete=django.db.models.deletion.CASCADE, to='HIFACHAMA.chamamember'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='phone',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AddField(
            model_name='loan',
            name='repayment_schedule',
            field=models.TextField(default=dict),
        ),
        migrations.AddField(
            model_name='meeting',
            name='description',
            field=models.TextField(default='No description provided'),
        ),
        migrations.AddField(
            model_name='notification',
            name='recipient_email',
            field=models.EmailField(default='default@example.com', max_length=254),
        ),
        migrations.AddField(
            model_name='notification',
            name='subject',
            field=models.CharField(default='No Subject', max_length=255),
        ),
        migrations.AddField(
            model_name='otp',
            name='expires_at',
            field=models.DateTimeField(default=datetime.datetime(2025, 5, 2, 8, 48, 59, 893619, tzinfo=datetime.timezone.utc)),
        ),
        migrations.AddField(
            model_name='paymentdetails',
            name='bank_account',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='withdrawal',
            name='amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='withdrawal',
            name='date',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='withdrawal',
            name='member',
            field=models.ForeignKey(default=HIFACHAMA.models.transactions.get_default_member, on_delete=django.db.models.deletion.CASCADE, to='HIFACHAMA.chamamember'),
        ),
        migrations.AlterField(
            model_name='chama',
            name='description',
            field=models.TextField(blank=True, default='No description provided.'),
        ),
        migrations.AlterField(
            model_name='chama',
            name='name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='chamamember',
            name='chama',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='HIFACHAMA.chama'),
        ),
        migrations.AlterField(
            model_name='chamamember',
            name='role',
            field=models.CharField(choices=[('Chairperson', 'Chairperson'), ('Treasurer', 'Treasurer'), ('Secretary', 'Secretary'), ('Member', 'Member')], default='Member', max_length=20),
        ),
        migrations.AlterField(
            model_name='chamamember',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='contribution',
            name='purpose',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='date_joined',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='is_staff',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(choices=[('Chairperson', 'Chairperson'), ('Treasurer', 'Treasurer'), ('Secretary', 'Secretary'), ('Member', 'Member')], default='Member', max_length=20),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='username',
            field=models.CharField(max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='loan',
            name='amount',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='loan',
            name='interest_rate',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='loan',
            name='member',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='HIFACHAMA.chamamember'),
        ),
        migrations.AlterField(
            model_name='loan',
            name='status',
            field=models.CharField(choices=[('approved', 'Approved'), ('pending', 'Pending')], max_length=50),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='chama',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='HIFACHAMA.chama'),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='location',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='title',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='notification',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='otp',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='withdrawal',
            name='reason',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterUniqueTogether(
            name='chamamember',
            unique_together={('user', 'chama')},
        ),
        migrations.DeleteModel(
            name='Transaction',
        ),
    ]
