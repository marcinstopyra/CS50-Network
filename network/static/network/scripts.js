// Test function to see if scripts.js are linked to the layout file and other tests
function check(num) {
    console.log(`worked! ${num}`)
}

function displayPage(section, requested_user=null) {
    // clear page from posts previously shown and a newPost container
    document.querySelector('#newPost-view').style.display = 'none';
    document.querySelector('#posts-view').innerHTML = ''
    document.querySelector('#profile-view').innerHTML = ''
    if (section === 'profile') {
        displayProfile(requested_user)
    } else {
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
        requestString = `/getUserPosts/${profile}`
        
    } else {
        requestString = `/getPosts/${section}`
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
                                <td class='like-btn' data-post_id='${post.id}'>Like it!</td>
                                <td class='show-comments-btn' data-post_id='${post.id}'>
                            </table>
                            </div>`;
        console.log(post.is_liked, 'Dorobic wizualnnosc!!');
        document.querySelector('#posts-view').append(element);
        }
    }).then( () => {
        document.querySelectorAll('.post-creator').forEach(profileLink => {
            profileLink.onclick = function() {
                displayProfile(this.dataset.profile);
            }   
        });
    });
    
    
}

function displayProfile(requested_user) {
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
    fetch(`profile/${requested_user}`)
    .then(response => response.json())
    .then(profile => {
    // setting a follow/unfollow button message
    follow_action = '+Follow';
    if (profile.is_followed){
        follow_action = '-Unfollow';
    }
    console.log(profile.is_followed)

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
