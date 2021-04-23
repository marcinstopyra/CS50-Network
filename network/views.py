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
    print("U MNIE DZIALA new post")
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
    # print(f"U MNIE DZIALA --- {section}")
    if section == "allPosts":
        posts = Post.objects.order_by('-time').all()

    elif section == "following":
        if request.user.is_authenticated == False:
            return JsonResponse({"message": "You are not logged in"}, status=400)
        current_user = request.user
        following = current_user.following.all()
        following = [follow.follow_to for follow in following]
        posts = Post.objects.filter(creator__in=following)      # 2x _ --https://stackoverflow.com/questions/9304908/how-can-i-filter-a-django-query-with-a-list-of-values
    # adding like and comments info to every post
    postsJSON = []
    for post in posts:
        postJSON = post.serialize()
        is_liked = Like.objects.filter(who=request.user, what=post).exists()
        print('Polajkowane?       ', is_liked)
        postJSON['is_liked'] = is_liked
        postsJSON.append(postJSON)
    # previous version without is_liked property 
    # return JsonResponse([post.serialize() for post in posts], safe=False)
    return JsonResponse(postsJSON, safe=False)

def getUserPosts(request, requested_user):
    if request.user.is_authenticated == False:
            return JsonResponse({"message": "You are not logged in"}, status=400)
    try:
        requested_userID = User.objects.get(username=requested_user).id
    except:
        return JsonResponse({'message': 'requested user doesn\'t exist in database'})
    posts = Post.objects.filter(creator=requested_userID)
    return JsonResponse([post.serialize() for post in posts], safe=False)

def getProfile(request, requested_username):
    try:
        requested_user = User.objects.get(username=requested_username)
    except:
        return JsonResponse({'message': 'requested user doesn\'t exist in database'})
    following = requested_user.following.all().count()
    followers = requested_user.followers.all().count()

    # check if the current user follows the requested user,
    # perform only if requested_user is different than currently logged user,
    # if user check his/her own account set is_followed = True (request.user is a user currently logged in - reminder)
    if requested_user != request.user:
        is_followed = Follow.objects.filter(follow_from=request.user, follow_to=requested_user).exists()
    else:
        is_followed = True
    return JsonResponse({
        "username": requested_username,
        'followers': followers,
        "following": following,
        "is_followed": is_followed   
    })


@login_required
def followUnfollow(request, username_followed, follow_status):
    try:
        user_followed = User.objects.get(username=username_followed)
    except:
        return JsonResponse({'message': f'There is no user with username: {username_followed}'})
    if request.user.username == user_followed:
        return JsonResponse({'message': 'You cannot follow yourself'})
    
    user_followed = User.objects.get(username=username_followed)
    print(user_followed)
    if follow_status == 'true':
        Follow.objects.filter(follow_from=request.user, follow_to=user_followed).delete()
        return JsonResponse({'message': f'user {username_followed} succesfully unfollowed'})
    else:
        newFollow = Follow(follow_from=request.user, follow_to=user_followed)
        newFollow.save()
        return JsonResponse({'message': f'user {username_followed} succesfully followed'})
    
    
