from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from .models import User, Post, Like, Comment, Follow


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def newPost(request):
    print("U MNIE DZIALA")
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # load model data and save it to Post model object
    data = json.loads(request.body)
    post = Post(
        creator=request.user,
        text=data.get("text", "")
    )
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)

def getPosts(request, section):
    print(f"U MNIE DZIALA --- {section}")
    if section == "allPosts":
        posts = Post.objects.order_by('-time').all()

    elif section == "following":
        if request.user.is_authenticated == False:
            return JsonResponse({"message": "You are not logged in"}, status=400)
        current_user = request.user
        following = current_user.following.all()
        following = [follow.follow_to for follow in following]
        print(following)
        posts = Post.objects.filter(creator__in=following)      # 2x _ --https://stackoverflow.com/questions/9304908/how-can-i-filter-a-django-query-with-a-list-of-values
    
    return JsonResponse([post.serialize() for post in posts], safe=False)