from django.urls import path

from . import views
 
urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newPost", views.newPost, name="newPost"),
    path("getPosts/<str:section>/<str:requested_user>/<str:pageNb>", views.getPosts, name="getPosts"),
    path("profile/<str:requested_username>", views.getProfile, name='getProfile'),
    path("profile/<str:username_followed>/<str:follow_status>", views.followUnfollow, name='followUnfollow'),
    path("likeIt/<str:liked_what>", views.likeIt, name='likeIt'),
    path("editPost/<str:postId>", views.editPost, name='editPost'),
    path("addComment/<str:postId>", views.addComment, name='addComment'),
    path("getComments/<str:postId>", views.getComments, name='getComments'),
    path('deleteComment/<str:commentId>', views.deleteComment, name='deleteComment')
]

handler404 = 'network.views.view_404'