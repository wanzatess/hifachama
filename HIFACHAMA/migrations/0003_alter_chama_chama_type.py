# Generated by Django 5.1.6 on 2025-03-26 20:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HIFACHAMA', '0002_chama_chama_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chama',
            name='chama_type',
            field=models.CharField(choices=[('merry_go_round', 'Merry-Go-Round'), ('investment', 'Investment'), ('hybrid', 'Hybrid')], default='merry_go_round', max_length=20),
        ),
    ]
