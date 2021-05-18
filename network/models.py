from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    creator = models.ForeignKey("User", on_delete=models.CASCADE, default=1)
    text = models.CharField(max_length=300)
    time = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.id}"
    
    def serialize(self):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "text": self.text,
            "time": self.time.strftime("%b %d %Y, %I:%M %p")
        }

class Comment(models.Model):
    comment_author = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    commented_post = models.ForeignKey(Post, on_delete=models.CASCADE, default=1)
    text = models.CharField(max_length=300)

    def serialize(self):
        return {
            'id': self.id,
            'author': self.comment_author.username,
            'post': self.commented_post.id,
            'text': self.text
        }

class Like(models.Model):
    who = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    what = models.ForeignKey(Post, on_delete=models.CASCADE, default=1)

class Follow(models.Model):
    follow_from = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    follow_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    def __str__(self):
        return f"{self.follow_from} -> {self.follow_to}"


