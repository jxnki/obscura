// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with a default user if none exists
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", "Anonymous");
  }


  // Initialize create and join event handlers
  initializeCreateEvent();
  initializeJoinEvent();
});


function showPage(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}


function showFeedback(id, message, type) {
  const feedback = document.getElementById(id);
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
  setTimeout(() => {
    feedback.className = 'feedback';
  }, 5000);
}


function formatDate(dateStr, timeStr) {
  const date = new Date(dateStr);
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}


function updateEventCounts(myCount, joinedCount) {
  document.getElementById('my-events-count').textContent = myCount;
  document.getElementById('joined-events-count').textContent = joinedCount;
}


function renderDashboard() {
  const myEventsContainer = document.getElementById("my-events");
  const joinedEventsContainer = document.getElementById("joined-events");
  const currentUser = localStorage.getItem("currentUser") || "Anonymous";
 
  myEventsContainer.innerHTML = "";
  joinedEventsContainer.innerHTML = "";
 
  let myEventsCount = 0;
  let joinedEventsCount = 0;
 
  events.forEach(ev => {
    const card = document.createElement("div");
    card.className = "card";
   
    card.innerHTML = `
      <div class="card-content">
        <h3>${ev.title}</h3>
        <p class="date">${formatDate(ev.date, ev.time)}</p>
        <div class="code-container">
          <p class="code">Event Code: ${ev.code}</p>
          <button class="share-btn copy-btn" onclick="copyText('${ev.code}', this, 'Code copied!')">
            <span class="share-icon">📋</span>
            Copy Code
          </button>
        </div>
        <p class="creator">Created by: ${ev.creator}</p>
        <p class="members">Members: ${ev.members.join(", ") || "No members yet"}</p>
      </div>
    `;
   
    if (ev.creator === currentUser) {
      myEventsContainer.appendChild(card);
      myEventsCount++;
    } else if (ev.members.includes(currentUser)) {
      joinedEventsContainer.appendChild(card);
      joinedEventsCount++;
    }
  });
 
  updateEventCounts(myEventsCount, joinedEventsCount);
 
  if (myEventsCount === 0) {
    myEventsContainer.innerHTML = '<div class="empty-state">No events created yet</div>';
  }
  if (joinedEventsCount === 0) {
    joinedEventsContainer.innerHTML = '<div class="empty-state">No events joined yet</div>';
  }
}


// Copy text helper
function copyText(text, button, successMessage) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMessage || 'Copied to clipboard!');
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<span class="share-icon">✓</span>Copied!';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    }
  }).catch(() => {
    showToast('Failed to copy text', 'error');
  });
}


// Confirm join function
function confirmJoin(code) {
  const currentUser = localStorage.getItem("currentUser") || "Anonymous";
  const ev = events.find(e => e.code === code);
 
  if (!ev.members.includes(currentUser)) {
    ev.members.push(currentUser);
    localStorage.setItem("routeifyEvents", JSON.stringify(events));
    showFeedback("join-feedback", `Successfully joined "${ev.title}"!`, "success");
    setTimeout(() => showPage("dashboard"), 2000);
  } else {
    showFeedback("join-feedback", "You're already a member of this event.", "error");
  }
}


// Toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
 
  setTimeout(() => toast.classList.add('show'), 10);
 
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// Create new route function
function createNewRoute(start, end) {
  const currentUser = localStorage.getItem("currentUser") || "Anonymous";
  const code = "EVT" + Math.floor(1000 + Math.random() * 9000);
 
  const newEvent = {
    title: `Route: ${start} to ${end}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    code,
    members: [],
    creator: currentUser,
    route: {
      start,
      end
    }
  };
 
  events.push(newEvent);
  localStorage.setItem("routeifyEvents", JSON.stringify(events));
 
  showFeedback("route-feedback", `Route created! Share code: ${code}`, "success");
  copyText(code, null, 'Route code copied to clipboard!');
 
  document.getElementById("route-form").reset();
  document.getElementById("matching-routes").innerHTML = "";
  setTimeout(() => showPage("dashboard"), 2000);
}


// Create Event
document.getElementById("create-form").addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const code = "EVT" + Math.floor(1000 + Math.random() * 9000);
  const currentUser = localStorage.getItem("currentUser");


  if (!currentUser) {
    const name = prompt("Please enter your name to create an event:", "");
    if (name) {
      localStorage.setItem("currentUser", name);
    } else {
      showFeedback("create-feedback", "Name is required to create an event.", "error");
      return;
    }
  }


  const newEvent = {
    title,
    date,
    time,
    code,
    members: [],
    creator: localStorage.getItem("currentUser")
  };
 
  events.push(newEvent);
  localStorage.setItem("routeifyEvents", JSON.stringify(events));
 
  showFeedback("create-feedback", `Event "${title}" created successfully!`, "success");
  copyText(code, null, 'Event code copied to clipboard!');
 
  e.target.reset();
  renderDashboard();
  setTimeout(() => showPage("dashboard"), 2000);
});


// Join Event
document.getElementById("join-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim().toUpperCase();


  const ev = events.find(e => e.code === code);
  if (!ev) {
    showFeedback("join-feedback", "Event not found. Please check the code and try again.", "error");
    return;
  }


  // Display event details before joining
  const feedback = document.getElementById("join-feedback");
  feedback.innerHTML = `
    <div class="event-preview">
      <h4>${ev.title}</h4>
      <p class="creator">Created by: ${ev.creator}</p>
      <p class="date">${formatDate(ev.date, ev.time)}</p>
      ${ev.route ? `<p class="route">Route: ${ev.route.start} to ${ev.route.end}</p>` : ''}
      <button onclick="confirmJoin('${code}')" class="btn-primary">Confirm Join</button>
    </div>
  `;
  e.target.reset();
});


