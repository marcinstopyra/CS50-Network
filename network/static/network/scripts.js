// Test function to see if scripts.js are linked to the layout file and other tests
function check(num) {
    console.log(`worked! ${num}`)
}

// When back arrow is clicked, show previous section
// window.onpopstate = function(event) {
//     console.log(event.state.section);
//     window.history.back();
//     window.history.forward();
// }

function displayPage(section, requested_user='%00', page=1) {
    // clear page from posts previously shown and a newPost container
    document.querySelector('#newPost-view').style.display = 'none';
    document.querySelector('#posts-view').innerHTML = ''
    document.querySelector('#profile-view').innerHTML = ''
    if (section === 'profile') {
        displayProfile(requested_user, page);
    } else {
        // history.pushState({section: section}, "", `/${section}`);
        displayPosts(section, requested_user, page);
}
}

function displayPosts(section, profile, page=1) {
    const current_user = JSON.parse(document.getElementById('current_user').textContent);
    if (section === 'allPosts') {
        if (current_user != ''){
            document.querySelector('#newPost-view').style.display = 'block';
            document.querySelector('#newPost-Btn').onclick = newPost;
        }
    }
    
    requestString = `/getPosts/${section}/${profile}/${page}`;
    console.log(requestString);
    fetch(requestString)
    .then(response => response.json())
    .then(response => {
      var posts = response.posts;
      var page = response.page;
      for (i = 0; i < posts.length; i++) {
        var post = posts[i];
        var element = document.createElement('div');
        element.setAttribute('value', `${post.id}`);
        element.innerHTML = `<br>
                            <div class='container-md' id='post-container-${post.id}'>
                            <h4 class='post-creator' data-profile='${post.creator}'>${post.creator}</h4>
                            <p>${post.text}</p>
                            <p id='post-time'>${post.time}</p>
                            <table id='comment-like-table'>
                                <td class='comment-btn' data-post_id='${post.id}' data-comment_number='${post.comment_number}'><div id='comment-counter-${post.id}'></div></td>
                                <td class='like-btn' id='like-btn-${post.id}' data-post_id='${post.id}' data-like_state='${post.is_liked}' data-like_number='${post.like_number}'><div id='like-counter-${post.id}'></div></td>
                            </table>
                            <button id='edit-btn' data-post_id='${post.id}' data-post_text='${post.text}'  type="button" class="btn btn-outline-secondary btn-sm">edit</button>                            
                            <div class='comment-section' id='comment-section-${post.id}' data-post_id='${post.id}' data-comment_number='${post.comment_number}></div>
                            <div id='edit-btn-div'></div>
                            </div>`;
        
        // set comment and like counters
        element.querySelector(`#comment-counter-${post.id}`).innerHTML = `Comments (${post.comment_number})`;
        element.querySelector(`#like-counter-${post.id}`).innerHTML = `Like it! (${post.like_number})`;
        // add edit button if current user is a post creator
        if (current_user === post.creator) {
            element.querySelector(`#edit-btn`).style.display = 'block';
        }
        
        document.querySelector('#posts-view').append(element);
        // set the proper like button display
        setLikeDisplay(post.id, post.is_liked);
        }
        setPagination(parseInt(page.page), page.isPrevious, page.isNext, section, profile);
    }).then( () => { // add hyperref to post author's profile 
        document.querySelectorAll('.post-creator').forEach(profileLink => {
            profileLink.onclick = function() {
                displayProfile(this.dataset.profile);
            }   
    });
    })
    .then( () => { // set event listener on like-btn
        document.querySelectorAll('.like-btn').forEach(likeBtn => {
            likeBtn.onclick = function() {
                // check if the user is logged in
                const isUserLoggedIn = JSON.parse(document.getElementById('isUserLoggedIn').textContent);
                if (isUserLoggedIn) {
                    var like_state = (this.dataset.like_state === 'true');  // converting string to boolean
                    likeIt(this.dataset.post_id, !like_state);
                    // update the like counter
                    var like_number = parseInt(this.dataset.like_number)
                    if (!like_state) {
                        like_number++;
                    } else {
                        like_number--;
                    }
                    this.querySelector('div').innerHTML = `Like it! (${like_number})`;
                    this.setAttribute('data-like_number', `${like_number}`);
                } else {
                    alert('You are not logged in')
                }
            }   
        });
    })
    .then(() => { // add edit post functionality
        document.querySelectorAll('#edit-btn').forEach(editBtn => {
            editBtn.onclick = function() {
                document.querySelector(`#post-container-${this.dataset.post_id}`).innerHTML = `<h4>Edit Post</h4>
                                                                                                    <textarea id='edit-post-text' cols=50 rows=5>${this.dataset.post_text}</textarea>
                                                                                                    <button onclick=editPost(${this.dataset.post_id}) id="editPost-Btn" class="btn btn-outline-secondary">edit</button>
                                                                                                    <button onclick=deletePost(${this.dataset.post_id}) id="deletePost-Btn" class="btn btn-outline-danger">delete</button>
                                                                                                    <button onclick=location.reload() id="cancelEditPost-Btn" class="btn btn-outline-secondary">cancel</button>`;

            }
        });
    })
    .then(() => { // add comment section toggle 
        document.querySelectorAll('.comment-btn').forEach(commentBtn => {
            commentBtn.onclick = function() {
                const isUserLoggedIn = JSON.parse(document.getElementById('isUserLoggedIn').textContent);
                // clear comment section
                commentSection = document.querySelector(`#comment-section-${this.dataset.post_id}`);
                commentSection.innerHTML = '';
                // toggle view of comment section onclick
                if (commentSection.style.display == 'block') {
                    commentSection.style.display = 'none';
                } else if(parseInt(commentSection.dataset.comment_number) > 0 || isUserLoggedIn) {
                    commentSection.style.display = 'block';
                }
                var newCommentForm = document.createElement('div');

                
                if (isUserLoggedIn) {
                    newCommentForm.innerHTML = `<div class="container" id="newComment-container">
                                                <textarea id='newComment-text-${this.dataset.post_id}' placeholder="comment here" rows='2'></textarea>
                                                <button onclick=addComment(${this.dataset.post_id}) id="newPost-Btn" class="btn btn-outline-secondary btn-sm">comment</button>
                                            </div>`;
                    commentSection.append(newCommentForm);
                }
                displayComments(commentSection);
                
            }
        });
    });
    
    
}

function displayProfile(requested_user, page=1) {
    // history.pushState({section: 'profile', requested_user: requested_user}, "", `/profile/${requested_user}`);
    // cleaning page
    document.querySelector('#posts-view').innerHTML = ''
    document.querySelector('#profile-view').innerHTML = ''
    // getting currently logged user's username
    const current_user = JSON.parse(document.getElementById('current_user').textContent);
    if (requested_user === current_user) {
        document.querySelector('#newPost-view').style.display = 'block';
    } else {
        document.querySelector('#newPost-view').style.display = 'none';
    }

    fetch(`/profile/${requested_user}`)
    .then(response => response.json())
    .then(profile => {
    // setting a follow/unfollow button message
    follow_action = '+Follow';
    if (profile.is_followed){
        follow_action = '-Unfollow';
    }
    // console.log(profile.is_followed)

    var element = document.createElement('div');
    element.innerHTML = `<br>
                        <div class='container-md' id='profile-container'>
                        <table>
                            <tr>
                                <td id='username-table'><h1>${profile.username}</h1></td>
                                <td id='follow-table'>
                                    <button type="button" class="btn btn-outline-secondary" data-follow_status='${profile.is_followed}' data-username='${profile.username}' id='follow-btn'>
                                        ${follow_action}
                                    </button>
                                </td>
                                <td id='follow-table'>Followers:</td>
                                <td id='number-table'>${profile.followers}</td>
                                <td id='follow-table'>Following:</td>
                                <td id='number-table'>${profile.following}</td>
                            </tr>
                        </table>
                        </div>`;
    document.querySelector('#profile-view').append(element);
    }).then( () => { 
        // Set follow button event listener (or hide the button if the user views his/her page)
        if (requested_user === current_user){
            document.querySelector('#follow-btn').style.display = 'none';
        } else {
            document.querySelector('#follow-btn').onclick = function() {
                 followUnfollow(this.dataset.username, this.dataset.follow_status)
            };
        };
    });

    displayPosts('profile', requested_user, page)
}

function newPost(event) {
    // event.preventDefault();

    let post_text = document.querySelector('#post-text').value.trim();
    console.log(post_text);
    if (post_text === '') {
        alert('The post cannot be empty');
    } else {
        fetch('/newPost', {
            method: 'POST',
            body: JSON.stringify({
              text: post_text
            })
          })
    }
    
    document.querySelector('#post-text').value = '';
    displayPage('allPosts');
}

function deletePost(post_id) {
    console.log(`TODO:  I delete ${post_id}`);
    fetch(`/editPost/${post_id}`, {
        method: 'POST',
        body: JSON.stringify({
            'text': null,
            'isDelete': true
        })
      }).then(() => {
        location.reload();
      });
}

function editPost(post_id) {
    // // event.preventDefault();
    console.log('edytuje see a co');

    let post_text = document.querySelector('#edit-post-text').value.trim();
    if (post_text === '') {
        alert('The post cannot be empty');
    } else {
        fetch(`/editPost/${post_id}`, {
            method: 'POST',
            body: JSON.stringify({
                'text': post_text,
                'isDelete': false
            })
          }).then(() => {
            location.reload();
          });
        
    }
}

function followUnfollow(username_followed, follow_status) {
    console.log(username_followed, follow_status);
    fetch(`/profile/${username_followed}/${follow_status}`)
    .then(response => response.json())
    .then(message => {
        console.log(message.message);
        displayProfile(username_followed);
    });  
}

function likeIt(liked_what, like_state) {
    fetch(`/likeIt/${liked_what}`).then(response => response.json()).then(response => {
        console.log(response.message)
    })
    .then(() => {
        setLikeDisplay(liked_what, like_state)
    })
}

function setLikeDisplay(liked_what, like_state) {
    // console.log('setLike', like_state)
    if (like_state) {
        // change display to 'liked'
        document.querySelector(`#like-btn-${liked_what}`).style.fontWeight = 'bold';
        document.querySelector(`#like-btn-${liked_what}`).style.color = 'rgb(23, 123, 253)';
        document.querySelector(`#like-btn-${liked_what}`).setAttribute("data-like_state", "true");
    } else {
        document.querySelector(`#like-btn-${liked_what}`).style.fontWeight = 'normal';
        document.querySelector(`#like-btn-${liked_what}`).style.color = 'grey';
        document.querySelector(`#like-btn-${liked_what}`).setAttribute("data-like_state", "false");
    }

}

function setPagination(pageNumber, isPrevious, isNext, currentSection, currentProfile) {
    if (isPrevious) {
        document.querySelector('#previous-page-btn').setAttribute("class", 'page-item');
        document.querySelector('#previous-page-btn').onclick = function() { displayPage(currentSection, currentProfile, pageNumber-1); }
    }
    else{
        document.querySelector('#previous-page-btn').setAttribute("class", 'page-item disabled');
        document.querySelector('#previous-page-btn').onclick = null;
    }
    if (isNext) {
        document.querySelector('#next-page-btn').setAttribute("class", 'page-item');
        document.querySelector('#next-page-btn').onclick = function() { displayPage(currentSection, currentProfile, (pageNumber+1)); }
    }
    else {
        document.querySelector('#next-page-btn').setAttribute("class", 'page-item disabled');
        document.querySelector('#next-page-btn').onclick = null;
    }
    document.querySelector('#page-number').innerHTML = `${pageNumber}`;    
}

function addComment(post_id) {
    let commentText = document.querySelector(`#newComment-text-${post_id}`).value.trim();
    if (commentText === '') {
        alert('The comment cannot be empty');
    } else {
        fetch(`/addComment/${post_id}`, {
            method: 'POST',
            body: JSON.stringify({
                'text': commentText
                // 'isDelete': false
            })
          }).then(() => {
            location.reload();
          });
    }
}

function displayComments(commentSection) {
    const current_user = JSON.parse(document.getElementById('current_user').textContent);
    post_id = commentSection.dataset.post_id;
    fetch(`getComments/${post_id}`)
    .then(response => response.json())
    .then(response => {
        comments = response;
        for (i = 0; i < comments.length; i++) {
            comment = comments[i];
            var commentElement = document.createElement('div');
            commentElement.innerHTML = `<br>
                                        <div class='comment-container'>
                                            <b>${comment.author}</b>
                                            <p>${comment.text}</p>
                                            <div class='delete-comment-btn'></div>
                                        </div>`;
            if (comment.author == current_user){
                commentElement.querySelector(`.delete-comment-btn`).innerHTML = `<button type="button" onclick=deleteComment(${comment.id}) class="btn btn-danger btn-sm" data-comment_id=${comment.id} id='delete-${comment.id}-comment'>delete</button>`
                // commentElement.querySelector(`#delete-${comment.id}-comment`).onclick = deleteComment(comment.id);
            }
            commentSection.append(commentElement);
        }

        
        
    });
}

function deleteComment(comment_id) {
    console.log('Delete comment', comment_id);
    // fetch(`deleteComment/${comment_id}`);
}

document.addEventListener('DOMContentLoaded', function () {
    // Use buttons to toggle between views
    document.querySelectorAll('.nav-link').forEach(button => { 
        button.onclick = function() { 
            displayPage(this.dataset.section, this.dataset.profile, 1); 
        }});
    // document.querySelector('#allPosts-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); }
    // document.querySelector('#following-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); } 
    // document.querySelector('#profile-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); } 

    //By default - load All posts
    displayPage('allPosts');
  });





