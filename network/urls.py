from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newPost", views.newPost, name="newPost"),
    path("getPosts/<str:section>", views.getPosts, name="getPosts"),
    path("getUserPosts/<str:requested_user>", views.getUserPosts, name='getUserPosts'),
    path("profile/<str:requested_username>", views.getProfile, name='getProfile'),
    path("profile/<str:username_followed>/<str:follow_status>", views.followUnfollow, name='followUnfollow')
]
