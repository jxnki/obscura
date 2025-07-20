// Follower privacy demonstration: only these users can see your location
const followingList = ['alice', 'bob']; // Fill with real usernames on backend

// Simple tab switching (for demonstration)
window.showTab = function(id) {
  document.querySelectorAll('.content').forEach(tab => tab.style.display='none');
  document.getElementById(id).style.display = '';
};
showTab('profileTab');

// --- LIVE LOCATION SHARING LOGIC ---
let liveLocationEnabled = false;
let liveLocationWatcher = null;
let myLiveLocation = null;
let profileMap = null, profileMarker = null;

// Toggle live location sharing on button click
document.getElementById('liveLocationToggle').onclick = function() {
  setLiveLocationSharing(!liveLocationEnabled);
};



let liveMap=null, liveMarker=null, liveWatcher=null;

const liveLocationSwitch = document.getElementById('liveLocationSwitch');
const liveLocationStatus = document.getElementById('liveLocationStatus');
const liveLocationError = document.getElementById('liveLocationError');
const liveLocationMapDiv = document.getElementById('liveLocationMap');

liveLocationSwitch?.addEventListener('change', function() {
  if (liveLocationSwitch.checked) {
    if (!navigator.geolocation) {
      liveLocationError.textContent = "Geolocation is not supported by your browser.";
      liveLocationError.style.display = '';
      liveLocationSwitch.checked = false;
      return;
    }
    liveLocationError.style.display = 'none';
    navigator.permissions?.query({name:"geolocation"}).then(function(res){
      if(res.state==="denied"){
        liveLocationError.textContent="Location permission denied. Enable in browser settings.";
        liveLocationError.style.display='';
        liveLocationSwitch.checked=false;
        return;
      } else {
        startLiveLocation();
      }
    }).catch(()=>{ startLiveLocation(); });
  } else {
    stopLiveLocation();
  }
});

function startLiveLocation() {
  liveLocationStatus.style.display = '';
  liveLocationMapDiv.style.display = '';
  if(!liveMap){
    liveMap = L.map('liveLocationMap').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:'© OpenStreetMap contributors'
    }).addTo(liveMap);
  }
  liveWatcher = navigator.geolocation.watchPosition(function(pos){
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    if (!liveMarker) {
      liveMarker = L.marker([lat, lng]).addTo(liveMap)
        .bindPopup("You are here (sharing live)").openPopup();
    } else {
      liveMarker.setLatLng([lat, lng]);
    }
    liveMap.setView([lat, lng], 16);
  }, function(err){
    liveLocationError.textContent="There was an error getting location.";
    liveLocationError.style.display='';
    stopLiveLocation();
  }, { enableHighAccuracy:true });
}

function stopLiveLocation() {
  liveLocationStatus.style.display = 'none';
  liveLocationMapDiv.style.display = 'none';
  liveLocationError.style.display = 'none';
  if(liveWatcher) navigator.geolocation.clearWatch(liveWatcher);
  if(liveMarker&&liveMap) { liveMap.removeLayer(liveMarker); liveMarker=null; }
}


function setLiveLocationSharing(enabled) {
  liveLocationEnabled = enabled;
  const btn = document.getElementById('liveLocationToggle');
  const status = document.getElementById('liveLocationStatus');
  if (enabled) {
    btn.textContent = "Disable";
    status.style.display = '';
    // Start tracking
    if (!liveLocationWatcher && navigator.geolocation) {
      liveLocationWatcher = navigator.geolocation.watchPosition(
        (pos) => {
          myLiveLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: Date.now()
          };
          showOwnLocationOnMap(myLiveLocation);
          // Here, send to backend for follower access; using localStorage for demo
          localStorage.setItem('myLiveLocation', JSON.stringify(myLiveLocation));
        },
        (err) => {
          alert('Permission denied or error with geolocation.');
          setLiveLocationSharing(false);
        },
        { enableHighAccuracy: true }
      );
    }
  } else {
    btn.textContent = "Enable";
    status.style.display = 'none';
    if (liveLocationWatcher) {
      navigator.geolocation.clearWatch(liveLocationWatcher);
      liveLocationWatcher = null;
    }
    // Delete locally stored location
    localStorage.removeItem('myLiveLocation');
    if (profileMarker) {
      profileMap.removeLayer(profileMarker);
      profileMarker = null;
    }
  }
}

// Show location on map only if user is in following list (demo logic)
function showOwnLocationOnMap(loc) {
  if (!profileMap) {
    profileMap = L.map('profileMap').setView([loc.lat, loc.lng], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(profileMap);
  }
  if (profileMarker) profileMap.removeLayer(profileMarker);
  profileMarker = L.marker([loc.lat, loc.lng]).addTo(profileMap)
    .bindPopup("You are here (live)").openPopup();
  profileMap.setView([loc.lat, loc.lng]);
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation not supported!');
    return;
  }
  navigator.geolocation.getCurrentPosition(function(pos){
    document.getElementById('start').value =
      pos.coords.latitude.toFixed(6)+", "+pos.coords.longitude.toFixed(6);
  }, function(){
    alert('Failed to get location (permission denied?)');
  });
}


function switchTab(tabId){
  document.querySelectorAll('.tab-content').forEach(e=>e.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(e=>e.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  const idx = ['my-events','join-event','create-event'].indexOf(tabId);
  if(idx>=0)
    document.querySelectorAll('.tab-btn')[idx].classList.add('active');
}


// Privacy enforcement: demo logic (replace with backend checks in a real app)
function canCurrentUserViewLocationOf(targetUsername) {
  // Simulate the logged-in username as "bob"
  const currentUser = 'bob';
  return followingList.includes(currentUser);
}

// (Optional) To demo: simulate another profile and check access
function showProfile(username) {
  if (canCurrentUserViewLocationOf(username)) {
    const loc = JSON.parse(localStorage.getItem('myLiveLocation'));
    if (loc) showOwnLocationOnMap(loc);
  } else {
    alert("Live location sharing is restricted to followers!");
  }
}

// On initial load, hide map if no location
if (!localStorage.getItem('myLiveLocation')) {
  document.getElementById('profileMap').style.display = 'none';
}
