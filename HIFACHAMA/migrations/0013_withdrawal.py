# Generated by Django 5.1.6 on 2025-04-19 10:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HIFACHAMA', '0012_contribution'),
    ]

    operations = [
        migrations.CreateModel(
            name='Withdrawal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reason', models.CharField(choices=[('personal', 'Personal'), ('medical', 'Medical'), ('emergency', 'Emergency'), ('investment', 'Investment'), ('other', 'Other')], max_length=30)),
                ('approval_status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('transaction', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='withdrawal_details', to='HIFACHAMA.transaction')),
            ],
        ),
    ]
