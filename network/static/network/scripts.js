// Test function to see if scripts.js are linked to the layout file and other tests
function check(num) {
    console.log(`worked! ${num}`)
}

// When back arrow is clicked, show previous section
window.onpopstate = function(event) {
    console.log(event.state.section);
    window.history.back();
    window.history.forward();


}

function displayPage(section, requested_user=null) {
    // clear page from posts previously shown and a newPost container
    document.querySelector('#newPost-view').style.display = 'none';
    document.querySelector('#posts-view').innerHTML = ''
    document.querySelector('#profile-view').innerHTML = ''
    if (section === 'profile') {
        displayProfile(requested_user);
    } else {
        history.pushState({section: section}, "", `/${section}`);
        displayPosts(section);
}
}

function displayPosts(section, profile=null) {
    if (section === 'allPosts') {
        const current_user = JSON.parse(document.getElementById('current_user').textContent);
        if (current_user != ''){
            document.querySelector('#newPost-view').style.display = 'block';
            document.querySelector('#newPost-Btn').onclick = newPost;
        }
    }
    if (section == 'profile'){
        requestString = `/getPosts/${section}/${profile}`
        
    } else {
        requestString = `/getPosts/${section}/requested_user=%00`
    }
    fetch(requestString)
    .then(response => response.json())
    .then(posts => {
      for (i = 0; i < posts.length; i++) {
        var post = posts[i];
        var element = document.createElement('div');
        element.setAttribute('value', `${post.id}`);
        element.innerHTML = `<br>
                            <div class='container-md' id='post-container'>
                            <h4 class='post-creator' data-profile='${post.creator}'>${post.creator}</h4>
                            <p>${post.text}</p>
                            <p id='post-time'>${post.time}</p>
                            <table id='comment-like-table'>
                                <td class='comment-btn' data-post_id='${post.id}'>Comment</td>
                                <td class='like-btn' id='like-btn-${post.id}' data-post_id='${post.id}' data-like_state='${post.is_liked}' data-like_number='${post.like_number}'><div id='like-counter-${post.like_number}'></></td>
                                <td class='show-comments-btn' data-post_id='${post.id}'>
                            </table>
                            </div>`;
        element.querySelector(`#like-counter-${post.like_number}`).innerHTML = `Like it! (${post.like_number})`
        document.querySelector('#posts-view').append(element);
        // set the proper like button display
        setLikeDisplay(post.id, post.is_liked);
        }
    }).then( () => {
        document.querySelectorAll('.post-creator').forEach(profileLink => {
            profileLink.onclick = function() {
                displayProfile(this.dataset.profile);
            }   
    });
    })
    .then( () => {
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
    });
    
    
}

function displayProfile(requested_user) {
    history.pushState({section: 'profile', requested_user: requested_user}, "", `/profile/${requested_user}`);
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

    displayPosts('profile', requested_user)
}

function newPost(event) {
    event.preventDefault();

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

document.addEventListener('DOMContentLoaded', function () {
    // Use buttons to toggle between views
    document.querySelectorAll('.nav-link').forEach(button => { 
        button.onclick = function() { 
            displayPage(this.dataset.section, this.dataset.profile); 
        }});
    // document.querySelector('#allPosts-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); }
    // document.querySelector('#following-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); } 
    // document.querySelector('#profile-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); } 

    //By default - load All posts
    displayPage('allPosts');
  });




// TODO: 
// - Likes
// - comments
// - history
// - follows
// - pagination
