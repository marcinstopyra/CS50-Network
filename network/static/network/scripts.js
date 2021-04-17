// Test function to see if scripts.js are linked to the layout file and other tests
function check(num) {
    console.log(`worked! ${num}`)
}

function displayPage(section) {
    if (section === 'profile') {
        displayProfile('me')
    } else {
        displayPosts(section);
}
}

function displayPosts(section) {
    if (section === 'allPosts') {
        document.querySelector('#newPost-display').style.display = 'block';
        document.querySelector('#newPost-Btn').onclick = newPost;
    }
    console.log(`display ${section} posts TODO`)
    fetch(`/getPosts/${section}`)
    .then(response => response.json())
    .then(posts => {
      for (i = 0; i < posts.length; i++) {
        var post = posts[i];
        var element = document.createElement('div');
        element.setAttribute('value', `${post.id}`);
        element.innerHTML = `<br>
                            <div class='container-md' id='post-container'>
                            <h4 class='post-creator' data-creator='${post.creator}'>${post.creator}</h4>
                            <p>${post.text}</p>
                            <p id='post-time'>${post.time}</p>
                            </div>`;
        document.querySelector('#posts-view').append(element);
        }
    }).then(document.querySelectorAll('.post-creator').forEach(profileLink => {
        profileLink.onclick = function() {
            check(this.dataset.creator);
        }   
    }));
}

function displayProfile(requested_user) {
    console.log(`profile of: ${requested_user}`);
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
    


document.addEventListener('DOMContentLoaded', function () {
    // Use buttons to toggle between views
    document.querySelectorAll('.nav-link').forEach(button => { 
        button.onclick = function() { 
            displayPage(this.dataset.section); 
        }});
    // document.querySelector('#allPosts-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); }
    // document.querySelector('#following-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); } 
    // document.querySelector('#profile-Nav-Btn').onclick = function() { displayPosts(this.dataset.section); } 

    //By default - load All posts
    displayPage('allPosts');
  });


