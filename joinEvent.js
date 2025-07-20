// Join event functionality
function initializeJoinEvent() {
  document.getElementById("route-form")?.addEventListener("submit", handleRouteSearch);
  document.getElementById("join-form")?.addEventListener("submit", handleJoinEvent);
}


function handleRouteSearch(e) {
  e.preventDefault();
  const start = document.getElementById("start").value.trim().toLowerCase();
  const end = document.getElementById("end").value.trim().toLowerCase();
 
  // Get existing events
  const events = JSON.parse(localStorage.getItem("routeifyEvents")) || [];
 
  // Find matching routes
  const matchingRoutes = events.filter(event => {
    if (!event.route) return false;
    const eventStart = event.route.start.toLowerCase();
    const eventEnd = event.route.end.toLowerCase();
    return eventStart.includes(start) || start.includes(eventStart) ||
           eventEnd.includes(end) || end.includes(eventEnd);
  });


  // Display matching routes
  const matchingRoutesContainer = document.getElementById("matching-routes");
  matchingRoutesContainer.innerHTML = "";


  if (matchingRoutes.length === 0) {
    matchingRoutesContainer.innerHTML = `
      <div class="empty-state">
        <p>No matching routes found. Would you like to create one?</p>
        <button onclick="createNewRoute('${start}', '${end}')" class="btn-primary">Create Route</button>
      </div>
    `;
  } else {
    const routesList = document.createElement("div");
    routesList.className = "routes-list";
    matchingRoutes.forEach(route => {
      const routeCard = document.createElement("div");
      routeCard.className = "route-card";
      routeCard.innerHTML = `
        <div class="route-info">
          <h4>${route.title}</h4>
          <p class="creator">Created by: ${route.creator}</p>
          <p class="date">${formatDate(route.date, route.time)}</p>
          <div class="code-container">
            <p class="code">Event Code: ${route.code}</p>
            <button class="share-btn copy-btn" onclick="copyText('${route.code}', this, 'Code copied!')">
              <span class="share-icon">📋</span>
              Copy Code
            </button>
          </div>
        </div>
      `;
      routesList.appendChild(routeCard);
    });
    matchingRoutesContainer.appendChild(routesList);
  }
}


function handleJoinEvent(e) {
  e.preventDefault();
  const code = document.getElementById("code").value.trim().toUpperCase();
  const events = JSON.parse(localStorage.getItem("routeifyEvents")) || [];


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
}


function createNewRoute(start, end) {
  const currentUser = localStorage.getItem("currentUser") || "Anonymous";
  const code = "EVT" + Math.floor(1000 + Math.random() * 9000);
  const events = JSON.parse(localStorage.getItem("routeifyEvents")) || [];
 
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
}


function confirmJoin(code) {
  const currentUser = localStorage.getItem("currentUser") || "Anonymous";
  const events = JSON.parse(localStorage.getItem("routeifyEvents")) || [];
  const ev = events.find(e => e.code === code);
 
  if (!ev.members.includes(currentUser)) {
    ev.members.push(currentUser);
    localStorage.setItem("routeifyEvents", JSON.stringify(events));
    showFeedback("join-feedback", `Successfully joined "${ev.title}"!`, "success");
  } else {
    showFeedback("join-feedback", "You're already a member of this event.", "error");
  }
}


// Export the initialization function
window.initializeJoinEvent = initializeJoinEvent;


