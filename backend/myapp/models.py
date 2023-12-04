from django.db import models

class Files(models.Model):
    filename = models.CharField(max_length=256)
    text = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)

