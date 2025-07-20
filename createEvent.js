// Event creation functionality
function initializeCreateEvent() {
  document.getElementById("create-form").addEventListener("submit", handleCreateEvent);
}

function handleCreateEvent(e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const code = "EVT" + Math.floor(1000 + Math.random() * 9000);
  const currentUser = localStorage.getItem("currentUser") || "Anonymous";

  const newEvent = { 
    title, 
    date,
    time,
    code, 
    members: [], 
    creator: currentUser
  };
  
  // Get existing events or initialize empty array
  const events = JSON.parse(localStorage.getItem("routeifyEvents")) || [];
  events.push(newEvent);
  localStorage.setItem("routeifyEvents", JSON.stringify(events));
  
  showFeedback("create-feedback", `Event "${title}" created successfully! Code: ${code}`, "success");
  copyText(code, null, 'Event code copied to clipboard!');
  e.target.reset();
}

// Export the initialization function
window.initializeCreateEvent = initializeCreateEvent;